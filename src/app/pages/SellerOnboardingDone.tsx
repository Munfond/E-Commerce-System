import { motion } from 'motion/react';
import { Link } from 'react-router';
import { CheckCircle2 } from 'lucide-react';
import { useSellerOnboarding } from '../seller/onboarding/useSellerOnboarding';

export default function SellerOnboardingDone() {
  const { data, reset } = useSellerOnboarding();

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="size-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hoàn tất đăng ký</h2>
          <p className="text-slate-600 mt-1">
            Thông tin đã được lưu tạm. Bạn có thể nối API để submit hồ sơ ở bước này.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <div className="text-sm font-semibold text-slate-900">Tóm tắt</div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
            <span className="text-slate-600">Tên shop</span>
            <span className="font-semibold text-slate-900 truncate max-w-[60%]">{data.shopName || '-'}</span>
          </div>
          <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
            <span className="text-slate-600">Vận chuyển</span>
            <span className="font-semibold text-slate-900">{data.shippingProvider || '-'}</span>
          </div>
          <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
            <span className="text-slate-600">Email</span>
            <span className="font-semibold text-slate-900 truncate max-w-[60%]">{data.email || '-'}</span>
          </div>
          <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
            <span className="text-slate-600">MST</span>
            <span className="font-semibold text-slate-900">{data.taxCode || '-'}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="h-10 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Tạo lại hồ sơ
        </button>
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Link
            to="/seller"
            className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors"
          >
            Vào dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

