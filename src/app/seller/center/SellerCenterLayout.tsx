import { Outlet, NavLink, Link } from 'react-router';
import { useEffect, useState } from 'react';
import { Bell, LayoutGrid, MessageCircle, ShoppingBag, Store, Package, ChevronDown, User, LogOut, TicketPercent } from 'lucide-react';
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
import { getSellerShopInfo } from '../../api/seller/sellerApi';

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: 'Trang chính',
    items: [{ to: '/seller', label: 'Dashboard', icon: LayoutGrid }],
  },
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
    title: 'Khuyến mãi',
    items: [{ to: '/seller/vouchers', label: 'Voucher', icon: TicketPercent }],
  },
  // Cài đặt đã bị ẩn, chỉ giữ menu chính cho seller
  // {
  //   title: 'Cài đặt',
  //   items: [{ to: '/seller/settings', label: 'Thiết lập', icon: Settings }],
  // },
];

export default function SellerCenterLayout() {
  const auth = useAuth();
  const [shopName, setShopName] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const res = await getSellerShopInfo();
        if (!alive) return;
        setShopName(res.data.shop_name ?? null);
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 py-3 md:h-14 md:py-0 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="size-9 rounded-lg bg-orange-600 text-white flex items-center justify-center">
              <Store className="size-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">ShopViet Seller Center</div>
              <div className="text-xs text-slate-500">Quản trị kênh người bán</div>
            </div>
          </Link>

          <div className="flex items-center gap-2 self-end md:self-auto">
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
                    {(() => {
                      const name = shopName ?? auth.user?.username ?? auth.user?.fullName ?? 'Seller';
                      const parts = name.split(/\s+/).filter(Boolean);
                      if (parts.length === 0) return 'S';
                      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
                      return (parts[0][0] + parts[1][0]).toUpperCase();
                    })()}
                  </div>
                  <span className="text-sm font-medium">{shopName ?? auth.user?.username ?? 'Seller'}</span>
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
        <div className="lg:hidden mb-4 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            {navGroups.flatMap((group) => group.items).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-orange-50 text-orange-700' : 'bg-slate-50 text-slate-700 hover:bg-slate-100',
                  ].join(' ')
                }
                end
              >
                <item.icon className="size-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <Link to="/seller/profile" className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              <User className="size-4" />
              <span>Hồ sơ</span>
            </Link>
            <Link to="/seller/register" className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              <LayoutGrid className="size-4" />
              <span>Hoàn thiện hồ sơ</span>
            </Link>
          </div>
        </div>

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

