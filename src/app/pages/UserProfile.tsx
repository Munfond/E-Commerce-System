import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, User, LogOut, ShieldCheck, Star } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useAuth } from '../auth/AuthProvider';
import { updateAccountProfile, changeAccountPassword, getMyAddresses, createMyAddress, deleteMyAddress, type MyAddressDto } from '../api/accountApi';
import { useCart } from '../contexts/cart';
import { categoryApi, type CategoryDto, type CategoryProductDto } from '../api/categoryApi';
import { resolveImageUrl } from '../api/imageUrl';

type FeaturedProduct = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  sold: number;
  category: string;
  description: string;
};

const mapFeaturedProduct = (product: CategoryProductDto, categoryName: string): FeaturedProduct => {
  const firstVariant = product.product_variants?.[0];
  const imagePath = product.product_images?.[0]?.file_path ?? '';

  return {
    id: product.id,
    name: product.name,
    price: firstVariant?.sale_price ?? 0,
    oldPrice: undefined,
    image: resolveImageUrl(imagePath),
    rating: 4.8,
    sold: 0,
    category: categoryName,
    description: product.name,
  };
};

const formatPrice = (value: number) => `₫${value.toLocaleString('vi-VN')}`;

export default function UserProfile() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { addToCart, buyNow } = useCart();
  const userName = auth.user?.fullName ?? auth.user?.username ?? auth.user?.email ?? 'Khách hàng';
  const isSeller = auth.user?.roles?.includes('seller') ?? false;

  const [username, setUsername] = useState(auth.user?.username ?? auth.user?.fullName ?? '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(auth.user?.avatarUrl ?? '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const avatarObjectUrlRef = useRef<string | null>(null);
  const [addresses, setAddresses] = useState<MyAddressDto[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState({
    label: '',
    recipient_name: '',
    recipient_phone: '',
    country: 'Việt Nam',
    city: '',
    district: '',
    ward: '',
    details: '',
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressSaveError, setAddressSaveError] = useState<string | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [featuredCategoryName, setFeaturedCategoryName] = useState('');

  useEffect(() => {
    setUsername(auth.user?.username ?? auth.user?.fullName ?? '');
    setAvatarFile(null);
    setAvatarPreviewUrl(auth.user?.avatarUrl ?? '');
  }, [auth.user]);

  useEffect(() => {
    if (!avatarFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
    }
    avatarObjectUrlRef.current = objectUrl;
    setAvatarPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
      if (avatarObjectUrlRef.current === objectUrl) {
        avatarObjectUrlRef.current = null;
      }
    };
  }, [avatarFile]);

  useEffect(() => {
    if (!auth.user) {
      setAddresses([]);
      return;
    }

    let alive = true;
    setAddressesLoading(true);
    setAddressesError(null);

    void getMyAddresses()
      .then((res) => {
        if (!alive) return;
        setAddresses(res.data);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setAddresses([]);
        setAddressesError(err instanceof Error ? err.message : 'Không tải được danh sách địa chỉ');
      })
      .finally(() => {
        if (!alive) return;
        setAddressesLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [auth.user]);

  useEffect(() => {
    let alive = true;

    void (async () => {
      try {
        const response = await categoryApi.getCategories();
        if (!alive) return;

        const eligibleCategories = response.data.filter((category: CategoryDto) => category.id >= 1 && category.id <= 9);
        const pool = eligibleCategories.length > 0 ? eligibleCategories : response.data;

        if (pool.length === 0) {
          setFeaturedProducts([]);
          setFeaturedCategoryName('');
          return;
        }

        const randomCategory = pool[Math.floor(Math.random() * pool.length)];
        setFeaturedCategoryName(randomCategory.name);

        const productsResponse = await categoryApi.getCategoryProducts(String(randomCategory.id));
        if (!alive) return;

        const items = Array.isArray(productsResponse.data?.data) ? productsResponse.data.data : [];
        setFeaturedProducts(items.slice(0, 8).map((item) => mapFeaturedProduct(item, randomCategory.name)));
      } catch {
        if (!alive) return;
        setFeaturedProducts([]);
        setFeaturedCategoryName('');
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setIsSavingProfile(true);

    try {
      if (!avatarFile) {
        throw new Error('Vui lòng chọn ảnh đại diện từ máy');
      }

      const res = await updateAccountProfile({ username, avatar_url: avatarFile });
      const updatedProfile = res.data.data;
      const updatedUser = {
        ...auth.user,
        username: updatedProfile.username,
        avatarUrl: updatedProfile.avatarUrl,
      };

      if (auth.token) {
        auth.setSession(auth.token, updatedUser);
      }

      toast.success('Cập nhật thông tin cá nhân thành công');
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Lỗi khi cập nhật profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp');
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await changeAccountPassword({ newPassword });
      if (res.data && (res.data as any).success) {
        toast.success('Đổi mật khẩu thành công');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordError('Đổi mật khẩu thất bại');
      }
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Lỗi khi đổi mật khẩu');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAddressFieldChange = (
    field: keyof typeof newAddress,
    value: string
  ) => {
    setNewAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaveError(null);

    if (!newAddress.label.trim() || !newAddress.recipient_name.trim() || !newAddress.recipient_phone.trim() || !newAddress.city.trim() || !newAddress.district.trim() || !newAddress.ward.trim() || !newAddress.details.trim()) {
      setAddressSaveError('Vui lòng nhập đầy đủ thông tin địa chỉ');
      return;
    }

    setIsSavingAddress(true);
    try {
      const res = await createMyAddress({
        label: newAddress.label.trim(),
        recipient_name: newAddress.recipient_name.trim(),
        recipient_phone: newAddress.recipient_phone.trim(),
        country: newAddress.country.trim(),
        city: newAddress.city.trim(),
        district: newAddress.district.trim(),
        ward: newAddress.ward.trim(),
        details: newAddress.details.trim(),
      });

      setAddresses((prev) => [res.data, ...prev]);
      setNewAddress({
        label: '',
        recipient_name: '',
        recipient_phone: '',
        country: 'Việt Nam',
        city: '',
        district: '',
        ward: '',
        details: '',
      });
      toast.success('Đã thêm địa chỉ mới');
    } catch (err: unknown) {
      setAddressSaveError(err instanceof Error ? err.message : 'Không thể thêm địa chỉ');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này không?');
    if (!confirmed) return;

    try {
      await deleteMyAddress(addressId);
      setAddresses((prev) => prev.filter((address) => address.id !== addressId));
      toast.success('Đã xóa địa chỉ');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa địa chỉ');
    }
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };

  const handleAddToCart = (productId: string | number) => {
    void addToCart(String(productId), 1);
    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleBuyNow = (productId: string | number) => {
    void buyNow(String(productId), 1);
    toast.success('Mua ngay thành công');
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-orange-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-orange-100/80">Gian hàng dành cho bạn</p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight">Xin chào, {userName}</h1>
                <p className="mt-4 max-w-2xl text-slate-100/90 text-base leading-7">
                  Khám phá ưu đãi mới nhất, mua sắm dễ dàng và tiếp tục hành trình trở thành Người bán ShopViet khi bạn sẵn sàng.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/products')}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-orange-600 shadow-lg shadow-orange-500/20 hover:bg-slate-100 transition"
                  >
                    Xem sản phẩm
                    <ArrowRight className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
                  >
                    <LogOut className="size-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>

              <div className="rounded-[2rem] bg-white/10 p-8 ring-1 ring-white/20 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-[1.5rem] bg-white/20 flex items-center justify-center text-orange-50">
                    <User className="size-8" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-100/90">Tài khoản</p>
                    <p className="text-2xl font-semibold">{userName}</p>
                  </div>
                </div>
                <div className="mt-8 space-y-4 text-sm text-orange-100/90">
                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="font-medium">Ưu đãi cá nhân</p>
                    <p>Giảm giá, sản phẩm đề xuất, và thông báo mới nhất.</p>
                  </div>
                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="font-medium">Trợ giúp</p>
                    <p>Hỗ trợ 24/7 và hướng dẫn mua sắm an toàn.</p>
                  </div>
                  <Link
                    to="/orders"
                    className="block rounded-3xl bg-white/10 p-4 transition hover:bg-white/20"
                  >
                    <p className="font-medium text-white">Đơn hàng</p>
                    <p className="text-sm text-orange-100/80">Xem lịch sử và trạng thái đơn hàng của bạn</p>
                  </Link>
                </div>
                {!isSeller && (
                  <button
                    type="button"
                    onClick={() => navigate('/seller/register')}
                    className="mt-8 w-full rounded-full bg-white text-orange-600 px-5 py-3 font-semibold hover:bg-slate-100 transition"
                  >
                    Trở thành Người bán ShopViet
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm" role="region" aria-label="Danh sách địa chỉ">
              <div className="flex items-center justify-between gap-4 mb-8">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Thông tin cá nhân</p>
                  <h2 className="text-3xl font-semibold text-slate-900">Cập nhật hồ sơ</h2>
                </div>
                <div className="rounded-full bg-slate-100 p-3 text-slate-600">
                  <User className="size-6" />
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleProfileSave}>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                    Tên người dùng
                  </label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên người dùng"
                  />
                </div>
                <div>
                  <label htmlFor="avatarUrl" className="block text-sm font-medium text-slate-700 mb-2">
                    Ảnh đại diện từ máy
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 hover:border-slate-400 hover:bg-slate-100 transition">
                    <span className="inline-flex size-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                      <ShieldCheck className="size-4" />
                    </span>
                    <span className="flex-1">{avatarFile ? avatarFile.name : 'Chọn file ảnh từ máy'}</span>
                    <input
                      id="avatarUrl"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                  </label>
                </div>
                {profileError ? (
                  <p className="text-sm text-rose-600">{profileError}</p>
                ) : null}
                <Button type="submit" disabled={isSavingProfile}>
                  {isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </form>

              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Đổi mật khẩu</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                      Mật khẩu mới
                    </label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-slate-700 mb-2">
                      Xác nhận mật khẩu
                    </label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                    />
                  </div>
                  {passwordError ? <p className="text-sm text-rose-600">{passwordError}</p> : null}
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
                  </Button>
                </form>
              </div>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Xem trước hồ sơ</p>
              <div className="mt-8 flex flex-col items-center gap-4">
                <div className="relative overflow-hidden rounded-full bg-slate-100 w-36 h-36">
                  <ImageWithFallback
                    src={avatarPreviewUrl || ''}
                    alt={username || userName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-slate-900">{username || userName}</p>
                  <p className="text-sm text-slate-500">Cập nhật tên người dùng và ảnh đại diện để cá nhân hóa tài khoản.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 pb-10">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Địa chỉ của bạn</p>
                <h2 className="text-3xl font-semibold text-slate-900">Thêm địa chỉ mới</h2>
              </div>

              <form className="space-y-4" onSubmit={handleCreateAddress}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="addressLabel">
                    Nhãn địa chỉ
                  </label>
                  <Input
                    id="addressLabel"
                    value={newAddress.label}
                    onChange={(e) => handleAddressFieldChange('label', e.target.value)}
                    placeholder="Văn phòng"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="recipientName">
                    Người nhận
                  </label>
                  <Input
                    id="recipientName"
                    value={newAddress.recipient_name}
                    onChange={(e) => handleAddressFieldChange('recipient_name', e.target.value)}
                    placeholder="Nguyễn Văn B"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="recipientPhone">
                    Số điện thoại
                  </label>
                  <Input
                    id="recipientPhone"
                    value={newAddress.recipient_phone}
                    onChange={(e) => handleAddressFieldChange('recipient_phone', e.target.value)}
                    placeholder="0987654321"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="country">
                    Quốc gia
                  </label>
                  <Input
                    id="country"
                    value={newAddress.country}
                    onChange={(e) => handleAddressFieldChange('country', e.target.value)}
                    placeholder="Việt Nam"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="city">
                      Tỉnh/Thành phố
                    </label>
                    <Input
                      id="city"
                      value={newAddress.city}
                      onChange={(e) => handleAddressFieldChange('city', e.target.value)}
                      placeholder="Thành phố Hồ Chí Minh"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="district">
                      Quận/Huyện
                    </label>
                    <Input
                      id="district"
                      value={newAddress.district}
                      onChange={(e) => handleAddressFieldChange('district', e.target.value)}
                      placeholder="Quận 1"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="ward">
                      Phường/Xã
                    </label>
                    <Input
                      id="ward"
                      value={newAddress.ward}
                      onChange={(e) => handleAddressFieldChange('ward', e.target.value)}
                      placeholder="Phường Bến Nghé"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="details">
                      Chi tiết địa chỉ
                    </label>
                    <Input
                      id="details"
                      value={newAddress.details}
                      onChange={(e) => handleAddressFieldChange('details', e.target.value)}
                      placeholder="Tầng 12, Tòa nhà Bitexco, 2 Hải Triều"
                    />
                  </div>
                </div>

                {addressSaveError ? <p className="text-sm text-rose-600">{addressSaveError}</p> : null}

                <Button type="submit" disabled={isSavingAddress}>
                  {isSavingAddress ? 'Đang lưu...' : 'Thêm địa chỉ'}
                </Button>
              </form>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Địa chỉ của bạn</p>
                  <h2 className="text-3xl font-semibold text-slate-900">Danh sách địa chỉ</h2>
                </div>
              </div>

            {addressesLoading ? (
              <p className="text-sm text-slate-500">Đang tải địa chỉ...</p>
            ) : addressesError ? (
              <p className="text-sm text-rose-600">{addressesError}</p>
            ) : addresses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                Chưa có địa chỉ nào được lưu cho tài khoản này.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {addresses.map((address, index) => (
                  <div key={address.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">Địa chỉ {index + 1}</p>
                          {address.isDefault ? (
                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                              Mặc định
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{address.receiverName || 'Địa chỉ người dùng'}</p>
                        <p className="mt-1 text-sm text-slate-600">{address.receiverPhone || 'Chưa có số điện thoại'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(address.id)}
                        className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                      >
                        Xóa
                      </button>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <div className="flex gap-2">
                        <span className="text-slate-400">Nhãn:</span>
                        <span className="text-slate-900">{address.label || 'Chưa đặt nhãn'}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-slate-400">Quốc gia:</span>
                        <span className="text-slate-900">{address.country || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-slate-400">Tỉnh/TP:</span>
                        <span className="text-slate-900">{address.city || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-slate-400">Quận/Huyện:</span>
                        <span className="text-slate-900">{address.district || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-slate-400">Phường/Xã:</span>
                        <span className="text-slate-900">{address.ward || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-slate-400">Chi tiết:</span>
                        <span className="text-slate-900">{address.details || 'Chưa cập nhật'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Sản phẩm gợi ý</p>
              <h2 className="text-3xl font-semibold text-slate-900">
                Cho bạn hôm nay{featuredCategoryName ? ` - ${featuredCategoryName}` : ''}
              </h2>
            </div>
            <Link to="/products" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
              Xem thêm tất cả
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden"
              >
                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800">
                    {product.category}
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Star className="size-4 text-yellow-400" />
                    <span>{product.rating} · Đã bán {product.sold}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-semibold text-orange-600">{formatPrice(product.price)}</p>
                    {product.oldPrice && (
                      <p className="text-sm text-slate-400 line-through">{formatPrice(product.oldPrice)}</p>
                    )}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product.id)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
                    >
                      Thêm vào giỏ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBuyNow(product.id)}
                      className="rounded-full bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700 transition"
                    >
                      Mua ngay
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
