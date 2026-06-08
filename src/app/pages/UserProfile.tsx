import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, User, LogOut, ShieldCheck, Star } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useAuth } from '../auth/AuthProvider';
import { updateAccountProfile, changeAccountPassword } from '../api/accountApi';
import { useCart } from '../contexts/cart';
import { products } from '../data/products';

const featuredProducts = products.slice(0, 8);

const formatPrice = (value: number) => `₫${value.toLocaleString('vi-VN')}`;

export default function UserProfile() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { addToCart, buyNow } = useCart();
  const userName = auth.user?.fullName ?? auth.user?.username ?? auth.user?.email ?? 'Khách hàng';
  const isSeller = auth.user?.roles?.includes('seller') ?? false;

  const [fullName, setFullName] = useState(auth.user?.fullName ?? auth.user?.username ?? '');
  const [avatarUrl, setAvatarUrl] = useState(auth.user?.avatarUrl ?? '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    setFullName(auth.user?.fullName ?? auth.user?.username ?? '');
    setAvatarUrl(auth.user?.avatarUrl ?? '');
  }, [auth.user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setIsSavingProfile(true);

    try {
      const res = await updateAccountProfile({ fullName, avatarUrl });
      const updatedUser = {
        ...auth.user,
        fullName: res.data.fullName,
        username: res.data.fullName,
        avatarUrl: res.data.avatarUrl,
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

  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };

  const handleAddToCart = (productId: number) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    addToCart(product, 1);
    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleBuyNow = (productId: number) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    buyNow(product, 1);
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
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
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
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                    Họ tên
                  </label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div>
                  <label htmlFor="avatarUrl" className="block text-sm font-medium text-slate-700 mb-2">
                    Ảnh đại diện URL
                  </label>
                  <Input
                    id="avatarUrl"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                  />
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
                    src={avatarUrl || ''}
                    alt={fullName || userName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-slate-900">{fullName || userName}</p>
                  <p className="text-sm text-slate-500">Cập nhật tên và avatar để cá nhân hóa tài khoản.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Sản phẩm gợi ý</p>
              <h2 className="text-3xl font-semibold text-slate-900">Cho bạn hôm nay</h2>
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
