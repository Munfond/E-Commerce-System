import { Outlet } from 'react-router';
import Header from '../../components/Header';

export default function SellerOnboardingLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-slate-900">Đăng ký trở thành Người bán</div>
                <div className="text-sm text-slate-600 mt-1">Điền đầy đủ thông tin trong một bước để hoàn tất đăng ký shop.</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

