import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useSellerOnboarding } from '../seller/onboarding/useSellerOnboarding';

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function isValidPhone(v: string) {
  const digits = v.replace(/[^\d]/g, '');
  return digits.length >= 9 && digits.length <= 12;
}

export default function SellerOnboardingShop() {
  const navigate = useNavigate();
  const { data, update } = useSellerOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canContinue = useMemo(() => {
    return (
      data.shopName.trim().length > 0 &&
      data.pickupAddress.trim().length > 0 &&
      isValidEmail(data.email) &&
      isValidPhone(data.phone)
    );
  }, [data.shopName, data.pickupAddress, data.email, data.phone]);

  const onNext = () => {
    const nextErrors: Record<string, string> = {};
    if (!data.shopName.trim()) nextErrors.shopName = 'Vui lòng nhập tên shop';
    if (!data.pickupAddress.trim()) nextErrors.pickupAddress = 'Vui lòng nhập địa chỉ lấy hàng';
    if (!data.email.trim()) nextErrors.email = 'Vui lòng nhập email';
    else if (!isValidEmail(data.email)) nextErrors.email = 'Email không hợp lệ';
    if (!data.phone.trim()) nextErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!isValidPhone(data.phone)) nextErrors.phone = 'Số điện thoại không hợp lệ';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) navigate('/seller/register/shipping');
  };

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
          {errors.shopName && <div className="mt-2 text-sm text-rose-600">{errors.shopName}</div>}
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
          {errors.pickupAddress && <div className="mt-2 text-sm text-rose-600">{errors.pickupAddress}</div>}
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
          {errors.email && <div className="mt-2 text-sm text-rose-600">{errors.email}</div>}
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
          {errors.phone && <div className="mt-2 text-sm text-rose-600">{errors.phone}</div>}
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
          onClick={onNext}
          className="h-10 px-5 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Tiếp theo
        </motion.button>
      </div>
    </div>
  );
}

