import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { User, Mail, ShieldCheck, ArrowLeft, Upload } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { getSellerShopInfo, updateSellerShopInfo } from '../api/seller/sellerApi';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { IMAGE_BASE_URL } from '../api/config';
import type { SellerShopInfoDto } from '../types/dto/seller';

const constructImageUrl = (filePath: string | undefined | null): string => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  return `${IMAGE_BASE_URL}${filePath}`;
};

export default function SellerProfile() {
  const auth = useAuth();
  const [shopInfo, setShopInfo] = useState<SellerShopInfoDto | null>(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopError, setShopError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    shopName: '',
    shopDescription: '',
    legalFullName: '',
    shopLogo: null as File | null,
  });

  const profile = useMemo(() => {
    return {
      name: auth.user?.email ? auth.user.email : 'Seller Demo',
      email: auth.user?.email ?? 'seller@shopviet.local',
      role: auth.user?.role ?? 'seller',
      memberSince: '2025-08-15',
      shopName: shopInfo?.shop_name ?? 'Đang tải... ',
      shopId: shopInfo?.id ?? '—',
    };
  }, [auth.user, shopInfo]);

  useEffect(() => {
    let alive = true;

    void (async () => {
      try {
        const response = await getSellerShopInfo();
        if (!alive) return;
        setShopInfo(response.data);
        setFormState((prev) => ({
          ...prev,
          shopName: response.data.shop_name || '',
          shopDescription: response.data.shop_description || '',
          legalFullName: response.data.legal_full_name || '',
        }));
      } catch (error) {
        if (!alive) return;
        setShopError('Không thể tải thông tin shop.');
      } finally {
        if (!alive) return;
        setShopLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFormState((prev) => ({ ...prev, shopLogo: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditSuccess(null);
    setIsSubmitting(true);

    try {
      await updateSellerShopInfo({
        shop_name: formState.shopName,
        shop_description: formState.shopDescription,
        legal_full_name: formState.legalFullName,
        shop_logo: formState.shopLogo ?? undefined,
      });
      setEditSuccess('Thông tin shop đã được cập nhật thành công.');
      if (shopInfo) {
        setShopInfo({
          ...shopInfo,
          shop_name: formState.shopName,
          shop_description: formState.shopDescription,
          legal_full_name: formState.legalFullName,
        });
      }
    } catch (error) {
      setEditError('Không thể cập nhật thông tin shop. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {shopError && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {shopError}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="size-14 rounded-3xl bg-orange-600 text-white flex items-center justify-center overflow-hidden">
                  {shopInfo?.shop_logo ? (
                    <ImageWithFallback
                      src={constructImageUrl(shopInfo.shop_logo)}
                      alt="Logo shop"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="size-7" />
                  )}
                </div>
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
                <span className="font-medium text-slate-900">Shop</span>
                <span>{shopLoading ? 'Đang tải...' : profile.shopName}</span>
              </div>
              {shopInfo?.shop_description ? (
                <div className="flex items-start gap-2">
                  <span className="font-medium text-slate-900">Mô tả</span>
                  <span>{shopInfo.shop_description}</span>
                </div>
              ) : null}
              {shopInfo?.legal_full_name ? (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">Người đại diện</span>
                  <span>{shopInfo.legal_full_name}</span>
                </div>
              ) : null}
              {shopInfo?.email ? (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">Email shop</span>
                  <span>{shopInfo.email}</span>
                </div>
              ) : null}
              {shopInfo?.phone ? (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">Điện thoại</span>
                  <span>{shopInfo.phone}</span>
                </div>
              ) : null}
              {shopInfo?.status ? (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">Trạng thái</span>
                  <span>{shopInfo.status}</span>
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">Mã shop</span>
                <span>{shopLoading ? '—' : profile.shopId}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">Tham gia từ:</span>
                <span>{profile.memberSince}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Cập nhật thông tin shop</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-sm text-slate-600">
              {(editError || editSuccess) && (
                <div className={editError ? 'rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700' : 'rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'}>
                  {editError ?? editSuccess}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tên shop</label>
                <input
                  name="shopName"
                  value={formState.shopName}
                  onChange={handleInputChange}
                  placeholder="Nhập tên shop"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả shop</label>
                <textarea
                  name="shopDescription"
                  value={formState.shopDescription}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Mô tả ngắn về shop"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Họ tên người đại diện</label>
                <input
                  name="legalFullName"
                  value={formState.legalFullName}
                  onChange={handleInputChange}
                  placeholder="Nhập họ tên người đại diện"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Logo shop</label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-600 hover:border-slate-400 hover:bg-slate-100">
                  <Upload className="size-4" />
                  <span>{formState.shopLogo ? formState.shopLogo.name : 'Chọn file logo'}</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                {formState.shopLogo && (
                  <div className="mt-2 text-xs text-slate-500">Đã chọn: {formState.shopLogo.name}</div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang lưu...' : 'Lưu thông tin shop'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
