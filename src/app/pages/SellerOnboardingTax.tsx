import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useSellerOnboarding } from '../seller/onboarding/useSellerOnboarding';

function isValidTaxCode(v: string) {
  const digits = v.replace(/[^\d]/g, '');
  return digits.length >= 10 && digits.length <= 14;
}

export default function SellerOnboardingTax() {
  const navigate = useNavigate();
  const { data, update } = useSellerOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canContinue = useMemo(() => isValidTaxCode(data.taxCode), [data.taxCode]);
  const onNext = () => {
    const nextErrors: Record<string, string> = {};
    if (!data.taxCode.trim()) nextErrors.taxCode = 'Vui lòng nhập mã số thuế';
    else if (!isValidTaxCode(data.taxCode)) nextErrors.taxCode = 'Mã số thuế không hợp lệ';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) navigate('/seller/register/done');
  };

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
          {errors.taxCode && <div className="mt-2 text-sm text-rose-600">{errors.taxCode}</div>}
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
            onClick={onNext}
            className="h-10 px-5 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tiếp theo
          </motion.button>
        </div>
      </div>
    </div>
  );
}

