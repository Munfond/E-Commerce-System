import { ShoppingBag, Facebook, Instagram, Youtube, Mail } from 'lucide-react';
import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="size-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="size-6 text-white" strokeWidth={2} />
              </div>
              <span className="text-xl font-bold text-white">ShopViet</span>
            </Link>
            <p className="text-sm">
              Nền tảng thương mại điện tử hàng đầu Việt Nam, mang đến trải nghiệm mua sắm tuyệt vời.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Về ShopViet</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white transition-colors">Giới thiệu</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Tuyển dụng</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Điều khoản</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white transition-colors">Hướng dẫn mua hàng</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Chính sách đổi trả</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Phương thức thanh toán</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Liên hệ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Kết nối với chúng tôi</h3>
            <div className="flex gap-4 mb-4">
              <a href="#" className="size-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="size-5" />
              </a>
              <a href="#" className="size-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors">
                <Instagram className="size-5" />
              </a>
              <a href="#" className="size-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors">
                <Youtube className="size-5" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="size-4" />
              <a href="mailto:support@shopviet.vn" className="hover:text-white transition-colors">
                support@shopviet.vn
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-sm text-center">
          <p>© 2026 ShopViet. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
