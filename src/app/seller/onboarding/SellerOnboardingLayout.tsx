import { Link, Outlet } from 'react-router';
import Header from '../../components/Header';
import { useAuth } from '../../auth/AuthProvider';

export default function SellerOnboardingLayout() {
  const auth = useAuth();
  const isSeller = auth.user?.roles?.includes('seller') ?? false;

  if (isSeller) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />

        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold text-slate-900">Bạn hiện đã là người bán</div>
                  <div className="text-sm text-slate-600 mt-1">Tài khoản của bạn đã có quyền seller, nên không cần đăng ký lại.</div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                <div className="text-base font-semibold text-emerald-900">Bạn đã đăng ký trở thành người bán.</div>
                <p className="mt-2 text-sm text-emerald-800">
                  Vui lòng truy cập trang quản lý Người bán để tiếp tục theo dõi và quản lý shop của bạn.
                </p>
                <div className="mt-4">
                  <Link
                    to="/seller"
                    className="inline-flex items-center rounded-full bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                  >
                    Đến trang Người bán
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

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

