import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useSellerOnboarding } from '../seller/onboarding/useSellerOnboarding';
import { registerSellerShop } from '../api/seller/sellerApi';
import { ApiError } from '../api/errors';
import type { SellerShopRegistrationDto } from '../types/dto/seller';

function isValidPhone(v: string) {
  const digits = v.replace(/[^\d]/g, '');
  return digits.length >= 9 && digits.length <= 12;
}

function isValidIdNumber(v: string) {
  const digits = v.replace(/[^\d]/g, '');
  return digits.length >= 9 && digits.length <= 12;
}

function isValidTaxCode(v: string) {
  const digits = v.replace(/[^\d]/g, '');
  return digits.length >= 10 && digits.length <= 14;
}

export default function SellerOnboardingShop() {
  const { data, update, reset } = useSellerOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'failed'>('idle');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      data.shopName.trim().length > 0 &&
      data.shopDescription.trim().length > 0 &&
      data.legalFullName.trim().length > 0 &&
      isValidIdNumber(data.identityNumber) &&
      isValidTaxCode(data.taxCode) &&
      data.receiverName.trim().length > 0 &&
      isValidPhone(data.receiverPhone) &&
      data.city.trim().length > 0 &&
      data.ward.trim().length > 0 &&
      data.details.trim().length > 0
    );
  }, [
    data.shopName,
    data.shopDescription,
    data.legalFullName,
    data.identityNumber,
    data.taxCode,
    data.receiverName,
    data.receiverPhone,
    data.city,
    data.ward,
    data.details,
  ]);

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
    const nextErrors: Record<string, string> = {};

    if (!data.shopName.trim()) nextErrors.shopName = 'Vui lòng nhập tên shop';
    if (!data.shopDescription.trim()) nextErrors.shopDescription = 'Vui lòng nhập mô tả shop';
    if (!data.legalFullName.trim()) nextErrors.legalFullName = 'Vui lòng nhập họ tên người đại diện';
    if (!data.identityNumber.trim()) nextErrors.identityNumber = 'Vui lòng nhập số CCCD/CMND';
    else if (!isValidIdNumber(data.identityNumber)) nextErrors.identityNumber = 'Số CCCD/CMND không hợp lệ';
    if (!data.taxCode.trim()) nextErrors.taxCode = 'Vui lòng nhập mã số thuế';
    else if (!isValidTaxCode(data.taxCode)) nextErrors.taxCode = 'Mã số thuế không hợp lệ';
    if (!data.receiverName.trim()) nextErrors.receiverName = 'Vui lòng nhập tên người nhận';
    if (!data.receiverPhone.trim()) nextErrors.receiverPhone = 'Vui lòng nhập số điện thoại người nhận';
    else if (!isValidPhone(data.receiverPhone)) nextErrors.receiverPhone = 'Số điện thoại không hợp lệ';
    if (!data.city.trim()) nextErrors.city = 'Vui lòng nhập tỉnh/thành phố';
    if (!data.ward.trim()) nextErrors.ward = 'Vui lòng nhập quận/huyện/phường';
    if (!data.details.trim()) nextErrors.details = 'Vui lòng nhập chi tiết địa chỉ';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus('failed');
      setAlertMessage('Vui lòng kiểm tra các trường bắt buộc và thử lại.');
      return;
    }

    setStatus('submitting');
    setAlertMessage(null);

    try {
      const response = await registerSellerShop(payload);
      setStatus('success');
      setAlertMessage(`Đăng ký thành công. ID hồ sơ: ${response.id}`);
      reset();
      setErrors({});
    } catch (e) {
      if (e instanceof ApiError) {
        const details = e.details as { details?: { fields?: Record<string, string> } } | undefined;
        const fieldErrors = (details && (details as any).details?.fields) as Record<string, string> | undefined;
        if (fieldErrors) setErrors(fieldErrors);
        setAlertMessage(e.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      } else {
        setAlertMessage('Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
      setStatus('failed');
    }
  };

  return (
    <div className="space-y-6">
      {alertMessage && (
        <div
          className={[
            'rounded-2xl px-4 py-3 text-sm',
            status === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'bg-rose-50 text-rose-700 border border-rose-100',
          ].join(' ')}
        >
          {alertMessage}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm font-semibold text-slate-900 mb-4">Thông tin Shop</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tên Shop <span className="text-orange-600">*</span>
            </label>
            <input
              value={data.shopName}
              onChange={(e) => update({ shopName: e.target.value })}
              placeholder="Tiệm Hạt Cà Phê 101"
              className="w-full h-11 px-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.shopName && <div className="mt-2 text-sm text-rose-600">{errors.shopName}</div>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mô tả Shop <span className="text-orange-600">*</span>
            </label>
            <textarea
              value={data.shopDescription}
              onChange={(e) => update({ shopDescription: e.target.value })}
              rows={4}
              placeholder="Chuyên cung cấp các sản phẩm làm bằng cà phê."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
            {errors.shopDescription && <div className="mt-2 text-sm text-rose-600">{errors.shopDescription}</div>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm font-semibold text-slate-900 mb-4">Thông tin Định danh</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Họ tên người đại diện <span className="text-orange-600">*</span>
            </label>
            <input
              value={data.legalFullName}
              onChange={(e) => update({ legalFullName: e.target.value })}
              placeholder="Nguyễn Văn A"
              className="w-full h-11 px-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.legalFullName && <div className="mt-2 text-sm text-rose-600">{errors.legalFullName}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Số CCCD/CMND <span className="text-orange-600">*</span>
            </label>
            <input
              value={data.identityNumber}
              onChange={(e) => update({ identityNumber: e.target.value })}
              placeholder="0396111222"
              inputMode="numeric"
              className="w-full h-11 px-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.identityNumber && <div className="mt-2 text-sm text-rose-600">{errors.identityNumber}</div>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mã số thuế <span className="text-orange-600">*</span>
            </label>
            <input
              value={data.taxCode}
              onChange={(e) => update({ taxCode: e.target.value })}
              placeholder="847291039"
              className="w-full h-11 px-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.taxCode && <div className="mt-2 text-sm text-rose-600">{errors.taxCode}</div>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm font-semibold text-slate-900 mb-4">Địa chỉ nhận hàng</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tên người nhận <span className="text-orange-600">*</span>
            </label>
            <input
              value={data.receiverName}
              onChange={(e) => update({ receiverName: e.target.value })}
              placeholder="Nguyễn Văn A"
              className="w-full h-11 px-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.receiverName && <div className="mt-2 text-sm text-rose-600">{errors.receiverName}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Số điện thoại người nhận <span className="text-orange-600">*</span>
            </label>
            <input
              value={data.receiverPhone}
              onChange={(e) => update({ receiverPhone: e.target.value })}
              placeholder="0910234567"
              inputMode="tel"
              className="w-full h-11 px-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.receiverPhone && <div className="mt-2 text-sm text-rose-600">{errors.receiverPhone}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tỉnh/Thành phố <span className="text-orange-600">*</span>
            </label>
            <input
              value={data.city}
              onChange={(e) => update({ city: e.target.value })}
              placeholder="Hà Nội"
              className="w-full h-11 px-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.city && <div className="mt-2 text-sm text-rose-600">{errors.city}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Quận/Huyện/Phường <span className="text-orange-600">*</span>
            </label>
            <input
              value={data.ward}
              onChange={(e) => update({ ward: e.target.value })}
              placeholder="Phường Cầu Giấy"
              className="w-full h-11 px-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.ward && <div className="mt-2 text-sm text-rose-600">{errors.ward}</div>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Chi tiết địa chỉ <span className="text-orange-600">*</span>
            </label>
            <input
              value={data.details}
              onChange={(e) => update({ details: e.target.value })}
              placeholder="Số 123, đường ABC"
              className="w-full h-11 px-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.details && <div className="mt-2 text-sm text-rose-600">{errors.details}</div>}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-600">Điền đầy đủ thông tin và nhấn Gửi đăng ký để hoàn tất.</div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              reset();
              setErrors({});
              setStatus('idle');
              setAlertMessage(null);
            }}
            className="h-10 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Xóa toàn bộ
          </button>
          <motion.button
            type="button"
            disabled={!canSubmit || status === 'submitting'}
            whileHover={{ scale: !canSubmit || status === 'submitting' ? 1 : 1.01 }}
            whileTap={{ scale: !canSubmit || status === 'submitting' ? 1 : 0.99 }}
            onClick={onSubmit}
            className="h-10 px-5 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? 'Đang gửi...' : 'Gửi đăng ký'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

