import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useSellerOnboarding } from '../seller/onboarding/useSellerOnboarding';

export default function SellerOnboardingShop() {
  const navigate = useNavigate();
  const { data, update } = useSellerOnboarding();

  const canContinue =
    data.shopName.trim().length > 0 &&
    data.pickupAddress.trim().length > 0 &&
    data.email.trim().length > 0 &&
    data.phone.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tên Shop <span className="text-orange-600">*</span>
          </label>
          <div className="relative">
            <input
              value={data.shopName}
              onChange={(e) => update({ shopName: e.target.value })}
              maxLength={30}
              placeholder="VD: ShopViet Official"
              className="w-full h-11 px-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
              {Math.min(30, data.shopName.length)}/30
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Địa chỉ lấy hàng <span className="text-orange-600">*</span>
          </label>
          <input
            value={data.pickupAddress}
            onChange={(e) => update({ pickupAddress: e.target.value })}
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
            className="w-full h-11 px-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email <span className="text-orange-600">*</span>
          </label>
          <input
            value={data.email}
            onChange={(e) => update({ email: e.target.value })}
            placeholder="example@email.com"
            type="email"
            className="w-full h-11 px-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Số điện thoại <span className="text-orange-600">*</span>
          </label>
          <input
            value={data.phone}
            onChange={(e) => update({ phone: e.target.value })}
            placeholder="VD: 0987654321"
            inputMode="tel"
            className="w-full h-11 px-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3">
        <button className="h-10 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors">
          Lưu
        </button>
        <motion.button
          type="button"
          disabled={!canContinue}
          whileHover={{ scale: canContinue ? 1.01 : 1 }}
          whileTap={{ scale: canContinue ? 0.99 : 1 }}
          onClick={() => navigate('/seller/register/shipping')}
          className="h-10 px-5 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Tiếp theo
        </motion.button>
      </div>
    </div>
  );
}

