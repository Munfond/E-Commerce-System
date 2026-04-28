import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useSellerOnboarding } from '../seller/onboarding/useSellerOnboarding';

export default function SellerOnboardingIdentity() {
  const navigate = useNavigate();
  const { data, update } = useSellerOnboarding();

  const canContinue =
    data.identityFullName.trim().length > 0 &&
    data.identityIdNumber.trim().length > 0 &&
    data.identityAddress.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Họ và tên (theo giấy tờ) <span className="text-orange-600">*</span>
          </label>
          <input
            value={data.identityFullName}
            onChange={(e) => update({ identityFullName: e.target.value })}
            placeholder="Nguyễn Văn A"
            className="w-full h-11 px-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Số CCCD/CMND <span className="text-orange-600">*</span>
          </label>
          <input
            value={data.identityIdNumber}
            onChange={(e) => update({ identityIdNumber: e.target.value })}
            placeholder="012345678901"
            inputMode="numeric"
            className="w-full h-11 px-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Địa chỉ thường trú <span className="text-orange-600">*</span>
          </label>
          <input
            value={data.identityAddress}
            onChange={(e) => update({ identityAddress: e.target.value })}
            placeholder="Phường/Xã, Quận/Huyện, Tỉnh/Thành"
            className="w-full h-11 px-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/seller/register/shipping')}
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
            onClick={() => navigate('/seller/register/tax')}
            className="h-10 px-5 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tiếp theo
          </motion.button>
        </div>
      </div>
    </div>
  );
}

