import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, User, LogOut, ShieldCheck, Star } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useAuth } from '../auth/AuthProvider';
import { useCart } from '../contexts/cart';
import { products } from '../data/products';

const featuredProducts = products.slice(0, 8);

const formatPrice = (value: number) => `₫${value.toLocaleString('vi-VN')}`;

export default function UserProfile() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { addToCart, buyNow } = useCart();
  const userName = auth.user?.username ?? auth.user?.email ?? 'Khách hàng';
  const isSeller = auth.user?.roles?.includes('seller') ?? false;

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
