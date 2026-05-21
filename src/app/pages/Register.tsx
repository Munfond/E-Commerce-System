import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ShoppingBag, Eye, EyeOff, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { api } from '../api/client';
import { endpoints } from '../api/endpoints';
import { setAccessToken, setRole } from '../api/authStorage';
import type { AuthUser } from '../auth/authTypes';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [stage, setStage] = useState<'register' | 'verify' | 'done'>('register');
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setServerMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post<{ message: string; otpSent?: boolean }>(
        endpoints.auth.register,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        },
        { auth: false }
      );

      setServerMessage(res.data.message || 'Tài khoản đã được tạo. OTP đã được gửi.');
      setStage('verify');
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Lỗi kết nối tới server. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setServerMessage(null);

    if (!otpCode.trim()) {
      setError('Vui lòng nhập mã OTP.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post<{ accessToken: string; user: AuthUser }>(
        endpoints.auth.verify,
        {
          email: formData.email,
          otpCode: otpCode.trim(),
        },
        { auth: false }
      );

      const token = res.data.accessToken;
      const user = res.data.user;
      
      setAccessToken(token);
      setRole(user.role);
      setServerMessage('Xác thực OTP thành công. Đang chuyển hướng...');
      
      setTimeout(() => {
        navigate('/seller', { replace: true });
      }, 1000);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Lỗi xác thực OTP. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12">
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
          <h1 className="text-3xl font-bold text-slate-900">ShopViet</h1>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Đăng ký</h2>
            <p className="text-slate-600">Tạo tài khoản mới để bắt đầu mua sắm</p>
          </div>

          {stage !== 'done' ? (
            <form onSubmit={stage === 'verify' ? handleVerify : handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}
              {serverMessage && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {serverMessage}
                </div>
              )}
              {stage === 'register' ? (
                <>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                      Tên đăng nhập
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                      <input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="username"
                        required
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@email.com"
                        required
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
                  </motion.button>
                </>
              ) : (
                <>
                  <div className="text-sm text-slate-600">
                    Mã OTP đã được gửi đến email <span className="font-semibold">{formData.email}</span>.
                  </div>
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-slate-700 mb-2">
                      Mã OTP
                    </label>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Nhập mã OTP"
                      required
                      className="w-full pl-4 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Đang xác thực OTP...' : 'Xác thực OTP'}
                  </motion.button>
                </>
              )}
            </form>
          ) : (
            <div className="space-y-5">
              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}
              {serverMessage && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {serverMessage}
                </div>
              )}
              <div className="text-slate-700">
                Đăng ký hoàn tất. Vui lòng đăng nhập để tiếp tục.
              </div>
              <motion.button
                type="button"
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Đến trang đăng nhập
              </motion.button>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-slate-600">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>© 2026 ShopViet. Bảo mật thông tin của bạn là ưu tiên hàng đầu.</p>
        </div>
      </motion.div>
    </div>
  );
}
