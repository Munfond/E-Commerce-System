import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useSellerOnboarding } from '../seller/onboarding/useSellerOnboarding';

const providers = [
  { id: 'shopviet', label: 'ShopViet Express (gợi ý)' },
  { id: 'ghtk', label: 'Giao Hàng Tiết Kiệm' },
  { id: 'ghn', label: 'Giao Hàng Nhanh' },
  { id: 'vnpost', label: 'VNPost' },
];

export default function SellerOnboardingShipping() {
  const navigate = useNavigate();
  const { data, update } = useSellerOnboarding();
  const [error, setError] = useState<string | null>(null);

  const canContinue = data.shippingProvider.trim().length > 0;
  const onNext = () => {
    if (!data.shippingProvider.trim()) {
      setError('Vui lòng chọn đơn vị vận chuyển.');
      return;
    }
    setError(null);
    navigate('/seller/register/identity');
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium text-slate-700 mb-3">
          Chọn đơn vị vận chuyển mặc định <span className="text-orange-600">*</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {providers.map((p) => {
            const active = data.shippingProvider === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setError(null);
                  update({ shippingProvider: p.id });
                }}
                className={[
                  'p-4 rounded-xl border text-left transition-colors',
                  active ? 'border-orange-600 bg-orange-50' : 'border-slate-200 hover:border-slate-300 bg-white',
                ].join(' ')}
              >
                <div className="font-semibold text-slate-900">{p.label}</div>
                <div className="text-xs text-slate-600 mt-1">Thiết lập phương thức giao hàng ưu tiên</div>
              </button>
            );
          })}
        </div>
        {error && <div className="mt-3 text-sm text-rose-600">{error}</div>}
      </div>

      <div className="border-t border-slate-100 pt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/seller/register/shop')}
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

