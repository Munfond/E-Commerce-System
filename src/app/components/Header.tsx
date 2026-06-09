import React from 'react';
import { ShoppingBag, ShoppingCart, Search, User, LogOut, Menu, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useCart } from '../contexts/cart';
import { useAuth } from '../auth/AuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

export default function Header({ cartCount }: { cartCount?: number }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const cart = cartCount ?? useCart()?.cartCount ?? 0;
  const userName = auth.user?.username ?? auth.user?.email ?? null;
  const [searchInput, setSearchInput] = React.useState('');

  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = searchInput.trim();
    if (keyword) {
      navigate(`/search?q=${encodeURIComponent(keyword)}`);
      setSearchInput('');
    }
  };

  return (
    <header className="bg-gradient-to-r from-orange-600 to-orange-500 sticky top-0 z-50 shadow-md">
      <div className="hidden md:block bg-orange-600/30 text-white text-xs py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/seller" className="hover:text-orange-100 transition-colors">
              Kênh Người Bán
            </Link>
            {auth.user?.role === 'admin' || auth.user?.roles?.includes('admin') ? (
              <Link to="/admin" className="border-l border-orange-400 pl-4 hover:text-orange-100 transition-colors">
                Admin
              </Link>
            ) : null}
            <Link
              to="/seller/register"
              className="border-l border-orange-400 pl-4 hover:text-orange-100 transition-colors"
            >
              Trở thành Người bán ShopViet
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {userName ? (
              <>
                <Link to="/profile" className="border-l border-orange-400 pl-4 hover:text-orange-100">
                  <User className="size-4 inline-block" /> {userName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="border-l border-orange-400 pl-4 hover:text-orange-100 flex items-center gap-2"
                >
                  <LogOut className="size-4" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="border-l border-orange-400 pl-4 hover:text-orange-100">
                  Đăng nhập
                </Link>
                <Link to="/register" className="hover:text-orange-100">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-wrap items-center gap-3 md:gap-6">
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 order-1">
              <div className="size-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <ShoppingBag className="size-7 text-white" strokeWidth={2} />
              </div>
              <span className="text-xl md:text-2xl font-bold text-white">ShopViet</span>
            </Link>

            <div className="order-3 md:order-2 w-full md:flex-1 md:max-w-3xl">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full h-11 md:h-12 px-4 pr-16 md:pr-20 rounded-lg md:rounded-sm outline-none text-slate-900 bg-white text-sm md:text-base"
                />
                <button type="submit" className="absolute right-0 top-0 bottom-0 h-full bg-orange-600 hover:bg-orange-700 px-4 text-white transition-colors flex items-center justify-center rounded-r-lg md:rounded-r-sm">
                  <Search className="size-4" />
                </button>
              </form>
            </div>

            <div className="order-2 md:order-3 ml-auto flex items-center gap-2 flex-shrink-0">
              <Link to="/cart" className="relative flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white bg-white/10 hover:bg-white/20 rounded-lg md:rounded-sm px-3 md:px-4 h-11 md:h-12 flex items-center justify-center"
                >
                  <ShoppingCart className="size-6 md:size-7" strokeWidth={1.5} />
                  {cart > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-white text-orange-600 text-xs rounded-full flex items-center justify-center px-1 font-semibold">
                      {cart}
                    </span>
                  )}
                </motion.div>
              </Link>

              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Mở menu"
                      className="size-11 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      <Menu className="size-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 rounded-2xl border border-slate-200 p-2 shadow-xl">
                    <DropdownMenuLabel className="text-xs uppercase tracking-wider text-slate-500">Điều hướng nhanh</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/" className="flex items-center justify-between w-full py-2">
                        <span>Trang chủ</span>
                        <ChevronRight className="size-4 text-slate-400" />
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/products" className="flex items-center justify-between w-full py-2">
                        <span>Sản phẩm</span>
                        <ChevronRight className="size-4 text-slate-400" />
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/seller" className="flex items-center justify-between w-full py-2">
                        <span>Kênh người bán</span>
                        <ChevronRight className="size-4 text-slate-400" />
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/seller/register" className="flex items-center justify-between w-full py-2">
                        <span>Trở thành người bán</span>
                        <ChevronRight className="size-4 text-slate-400" />
                      </Link>
                    </DropdownMenuItem>
                    {auth.user?.role === 'admin' || auth.user?.roles?.includes('admin') ? (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center justify-between w-full py-2">
                          <span>Admin</span>
                          <ChevronRight className="size-4 text-slate-400" />
                        </Link>
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    {userName ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/profile" className="flex items-center justify-between w-full py-2">
                            <span>{userName}</span>
                            <ChevronRight className="size-4 text-slate-400" />
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="py-2 text-red-600">
                          <span>Đăng xuất</span>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/login" className="flex items-center justify-between w-full py-2">
                            <span>Đăng nhập</span>
                            <ChevronRight className="size-4 text-slate-400" />
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/register" className="flex items-center justify-between w-full py-2">
                            <span>Đăng ký</span>
                            <ChevronRight className="size-4 text-slate-400" />
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
