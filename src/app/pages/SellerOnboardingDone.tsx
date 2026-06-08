import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { CheckCircle2 } from 'lucide-react';
import { useSellerOnboarding } from '../seller/onboarding/useSellerOnboarding';
import { registerSellerShop } from '../api/seller/sellerApi';
import { ApiError } from '../api/errors';
import type { SellerShopRegistrationDto } from '../types/dto/seller';

export default function SellerOnboardingDone() {
  const { data, reset } = useSellerOnboarding();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const payload = useMemo<SellerShopRegistrationDto>(
    () => ({
      shop_info: {
        shop_name: data.shopName,
        shop_description: data.shopDescription,
        legal_full_name: data.legalFullName,
        identity_number: data.identityNumber,
        tax_code: data.taxCode,
      },
      shop_address: {
        receiver_name: data.receiverName,
        receiver_phone: data.receiverPhone,
        city: data.city,
        ward: data.ward,
        details: data.details,
      },
    }),
    [data]
  );

  const onSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      await registerSellerShop(payload);
      reset();
      navigate('/seller/products', { replace: true });
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message || 'Gửi hồ sơ thất bại.');
        const details = e.details as { details?: { fields?: Record<string, string> } } | undefined;
        const fields = (details && typeof details === 'object' ? (details as any).details?.fields : undefined) as
          | Record<string, string>
          | undefined;
        if (fields) setFieldErrors(fields);
        return;
      }
      setError('Gửi hồ sơ thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="size-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hoàn tất đăng ký</h2>
          <p className="text-slate-600 mt-1">
            Kiểm tra lại thông tin, sau đó gửi hồ sơ để hoàn tất.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

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
        {Object.keys(fieldErrors).length > 0 && (
          <div className="mt-4 text-sm text-rose-700">
            Vui lòng kiểm tra lại: {Object.keys(fieldErrors).join(', ')}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 pt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="h-10 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Tạo lại hồ sơ
        </button>
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
            onClick={onSubmit}
            className="h-10 px-5 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi hồ sơ'}
          </motion.button>
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Link
              to="/seller/products"
              className="inline-flex items-center justify-center h-10 px-5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Về Seller Center
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

