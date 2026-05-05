import { useMemo } from 'react';
import { Link } from 'react-router';
import { User, Mail, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

export default function SellerProfile() {
  const auth = useAuth();

  const profile = useMemo(() => {
    return {
      name: auth.user?.email ? auth.user.email : 'Seller Demo',
      email: auth.user?.email ?? 'seller@shopviet.local',
      role: auth.user?.role ?? 'seller',
      memberSince: '2025-08-15',
      shopName: 'ShopViet Official',
    };
  }, [auth.user]);

  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-500 mb-3">
        Trang chủ <span className="mx-2">›</span> <span className="text-slate-700">Thông tin Seller</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Thông tin người bán</h1>
            <p className="text-sm text-slate-500">Quản lý thông tin tài khoản seller của bạn.</p>
          </div>
          <Link
            to="/seller/products"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="size-4" />
            Quay lại
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-3xl bg-orange-600 text-white flex items-center justify-center">
                <User className="size-7" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Tên người bán</p>
                <p className="text-lg font-semibold text-slate-900">{profile.name}</p>
              </div>
            </div>
            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-slate-400" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-slate-400" />
                <span>Vai trò: {profile.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">Shop:</span>
                <span>{profile.shopName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">Tham gia từ:</span>
                <span>{profile.memberSince}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Cài đặt nhanh</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-xl bg-white border border-slate-200 p-4">
                <p className="font-medium text-slate-900">Hồ sơ cửa hàng</p>
                <p className="text-slate-500">Cập nhật thông tin liên hệ, địa chỉ, logo.</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 p-4">
                <p className="font-medium text-slate-900">Bảo mật</p>
                <p className="text-slate-500">Thay đổi mật khẩu và xác thực hai yếu tố.</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 p-4">
                <p className="font-medium text-slate-900">Chính sách giao hàng</p>
                <p className="text-slate-500">Quản lý đơn vị vận chuyển và cấu hình phí.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
