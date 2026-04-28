import { ShoppingBag, ShoppingCart, Search, Bell } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';

export default function Header({ cartCount = 0 }: { cartCount?: number }) {
  return (
    <header className="bg-gradient-to-r from-orange-600 to-orange-500 sticky top-0 z-50 shadow-md">
      <div className="bg-orange-600/30 text-white text-xs py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/seller" className="hover:text-orange-100 transition-colors">
              Kênh Người Bán
            </Link>
            <span className="border-l border-orange-400 pl-4">Trở thành Người bán ShopViet</span>
            <span className="border-l border-orange-400 pl-4">Tải ứng dụng</span>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="size-4" />
            <span>Thông báo</span>
            <Link to="/login" className="border-l border-orange-400 pl-4 hover:text-orange-100">
              Đăng nhập
            </Link>
            <Link to="/register" className="hover:text-orange-100">
              Đăng ký
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <div className="size-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <ShoppingBag className="size-7 text-white" strokeWidth={2} />
              </div>
              <span className="text-2xl font-bold text-white">ShopViet</span>
            </Link>

            <div className="flex-1 max-w-3xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full h-12 px-4 pr-20 rounded-sm outline-none text-slate-900 bg-white"
                />
                <button className="absolute right-0 top-0 bottom-0 h-full bg-orange-600 hover:bg-orange-700 px-4 text-white transition-colors flex items-center justify-center rounded-r-sm">
                  <Search className="size-4" />
                </button>
              </div>
              <div className="flex gap-3 mt-2 text-xs text-white">
                <a href="#" className="hover:text-orange-100">Áo thun</a>
                <a href="#" className="hover:text-orange-100">Điện thoại</a>
                <a href="#" className="hover:text-orange-100">Laptop</a>
                <a href="#" className="hover:text-orange-100">Tai nghe</a>
              </div>
            </div>

            <Link to="/cart" className="relative flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-white bg-white/10 hover:bg-white/20 rounded-sm px-4 h-12 flex items-center justify-center"
              >
                <ShoppingCart className="size-7" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-white text-orange-600 text-xs rounded-full flex items-center justify-center px-1 font-semibold">
                    {cartCount}
                  </span>
                )}
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
