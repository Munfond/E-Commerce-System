import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-6"
      >
        <Link to="/" className="flex items-center justify-center gap-3 mb-12">
          <div className="size-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <ShoppingBag className="size-7 text-white" strokeWidth={2} />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            ShopViet
          </h1>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!isSent ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Quên mật khẩu
                </h2>

                <p className="text-slate-600">
                  Nhập email của bạn để nhận link đặt lại mật khẩu
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Email
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      required
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
                </motion.button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="size-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="size-8 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Kiểm tra email của bạn
              </h2>

              <p className="text-slate-600 mb-6">
                Chúng tôi đã gửi link đặt lại mật khẩu đến{' '}
                <span className="font-medium text-slate-900">
                  {email}
                </span>
              </p>

              <p className="text-sm text-slate-500 mb-6">
                Không nhận được email? Kiểm tra thư mục spam hoặc thử gửi lại.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setIsSent(false)}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Gửi lại email
                </button>

                <Link
                  to="/login"
                  className="w-full text-center bg-slate-100 text-slate-900 py-3 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </motion.div>
          )}

          {!isSent && (
            <div className="mt-8">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="size-4" />
                <span>Quay lại đăng nhập</span>
              </Link>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>
            © 2026 ShopViet. Bảo mật thông tin của bạn là ưu tiên hàng đầu.
          </p>
        </div>
      </motion.div>
    </div>
  );
}