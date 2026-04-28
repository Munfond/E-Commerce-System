import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useSellerOnboarding } from '../seller/onboarding/useSellerOnboarding';

export default function SellerOnboardingTax() {
  const navigate = useNavigate();
  const { data, update } = useSellerOnboarding();

  const canContinue = data.taxCode.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Mã số thuế <span className="text-orange-600">*</span>
          </label>
          <input
            value={data.taxCode}
            onChange={(e) => update({ taxCode: e.target.value })}
            placeholder="VD: 0123456789"
            inputMode="numeric"
            className="w-full h-11 px-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tên công ty/Hộ kinh doanh</label>
          <input
            value={data.taxCompanyName}
            onChange={(e) => update({ taxCompanyName: e.target.value })}
            placeholder="(không bắt buộc)"
            className="w-full h-11 px-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/seller/register/identity')}
          className="h-10 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Quay lại
        </button>
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors">
            Lưu
          </button>
          <motion.button
            type="button"
            disabled={!canContinue}
            whileHover={{ scale: canContinue ? 1.01 : 1 }}
            whileTap={{ scale: canContinue ? 0.99 : 1 }}
            onClick={() => navigate('/seller/register/done')}
            className="h-10 px-5 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tiếp theo
          </motion.button>
        </div>
      </div>
    </div>
  );
}

