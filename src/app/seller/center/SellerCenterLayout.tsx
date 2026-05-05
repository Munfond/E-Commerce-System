import { Outlet, NavLink, Link } from 'react-router';
import { Bell, LayoutGrid, MessageCircle, Settings, ShoppingBag, Store, Package, ChevronDown, User, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { useAuth } from '../../auth/AuthProvider';

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: 'Quản lý đơn hàng',
    items: [{ to: '/seller/orders', label: 'Đơn hàng', icon: ShoppingBag }],
  },
  {
    title: 'Quản lý sản phẩm',
    items: [
      { to: '/seller/products', label: 'Sản phẩm', icon: Package },
      { to: '/seller/inventory', label: 'Kho hàng', icon: Store },
    ],
  },
  {
    title: 'Cài đặt',
    items: [{ to: '/seller/settings', label: 'Thiết lập', icon: Settings }],
  },
];

export default function SellerCenterLayout() {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="size-9 rounded-lg bg-orange-600 text-white flex items-center justify-center">
              <Store className="size-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">ShopViet Seller Center</div>
              <div className="text-xs text-slate-500">Quản trị kênh người bán</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button className="size-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600">
              <MessageCircle className="size-5" />
            </button>
            <button className="size-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600">
              <Bell className="size-5" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 px-3 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-700">
                  <div className="size-7 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                    SV
                  </div>
                  <span className="text-sm font-medium">Seller</span>
                  <ChevronDown className="size-4 text-slate-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/seller/profile" className="flex items-center gap-2 w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Thông tin cá nhân</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Cài đặt tài khoản</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  auth.logout();
                  toast.success('Đã đăng xuất thành công');
                }} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <div className="flex gap-4">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <LayoutGrid className="size-4 text-slate-600" />
                <div className="text-sm font-semibold text-slate-900">Menu</div>
              </div>
              <div className="p-2">
                {navGroups.map((g) => (
                  <div key={g.title} className="mb-2">
                    <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                      {g.title}
                    </div>
                    <div className="space-y-1">
                      {g.items.map((it) => (
                        <NavLink
                          key={it.to}
                          to={it.to}
                          className={({ isActive }) =>
                            [
                              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                              isActive ? 'bg-orange-50 text-orange-700' : 'text-slate-700 hover:bg-slate-50',
                            ].join(' ')
                          }
                          end
                        >
                          <it.icon className="size-4" />
                          <span className="font-medium">{it.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="px-3 pt-2 pb-3">
                  <Link to="/seller/register" className="text-sm font-medium text-orange-600 hover:text-orange-700">
                    Hoàn thiện hồ sơ người bán
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          <section className="flex-1 min-w-0">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  );
}

