import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ShoppingBag, ArrowLeft, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { api } from '../api/client';
import { endpoints } from '../api/endpoints';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [stage, setStage] = useState<'request' | 'verify' | 'reset' | 'done'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setServerMessage(null);

    try {
      const res = await api.post<{ message: string }>(
        endpoints.auth.passwordReset.request,
        { email },
        { auth: false }
      );

      setServerMessage(res.data.message || 'OTP đã được gửi đến email của bạn.');
      setStage('verify');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi gửi yêu cầu. Vui lòng thử lại.');
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
      const res = await api.post<{ success: boolean }>(
        endpoints.auth.passwordReset.verify,
        {
          email,
          otpCode: otpCode.trim(),
        },
        { auth: false }
      );

      if (res.data.success) {
        setServerMessage('OTP hợp lệ. Vui lòng đặt lại mật khẩu mới.');
        setStage('reset');
      } else {
        setError('Xác thực OTP thất bại. Vui lòng thử lại.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi xác thực OTP. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setServerMessage(null);

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      setIsLoading(false);
      return;
    }

    if (!newPassword.trim()) {
      setError('Vui lòng nhập mật khẩu mới.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post<{ success: boolean }>(
        endpoints.auth.passwordReset.reset,
        {
          email,
          newPassword,
        },
        { auth: false }
      );

      if (res.data.success) {
        setServerMessage('Mật khẩu của bạn đã được đặt lại thành công.');
        setStage('done');
      } else {
        setError('Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRequest = () => {
    setStage('request');
    setOtpCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setServerMessage(null);
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
          {stage !== 'done' ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Quên mật khẩu
                </h2>

                <p className="text-slate-600">
                  {stage === 'request' && 'Nhập email của bạn để nhận OTP xác thực.'}
                  {stage === 'verify' && 'Nhập mã OTP đã được gửi đến email của bạn.'}
                  {stage === 'reset' && 'Nhập mật khẩu mới để hoàn tất đặt lại mật khẩu.'}
                </p>
              </div>

              <form
                onSubmit={
                  stage === 'request'
                    ? handleRequest
                    : stage === 'verify'
                    ? handleVerify
                    : handleReset
                }
                className="space-y-5"
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
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
                      disabled={stage !== 'request'}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>
                </div>

                {stage === 'verify' && (
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-slate-700 mb-2">
                      Mã OTP
                    </label>
                    <input
                      id="otp"
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Nhập mã OTP"
                      required
                      className="w-full pl-4 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                )}

                {stage === 'reset' && (
                  <>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                        Mật khẩu mới
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                        <input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
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
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {stage === 'request' && (isLoading ? 'Đang gửi...' : 'Gửi OTP')}
                  {stage === 'verify' && (isLoading ? 'Đang xác thực...' : 'Xác thực OTP')}
                  {stage === 'reset' && (isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu')}
                </motion.button>

                {(stage === 'verify' || stage === 'reset') && (
                  <button
                    type="button"
                    onClick={handleBackToRequest}
                    className="w-full bg-slate-100 text-slate-900 py-3 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                  >
                    Quay lại bước trước
                  </button>
                )}
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="size-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="size-8 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">Đã đặt lại mật khẩu thành công</h2>
              <p className="text-slate-600 mb-6">Bạn có thể sử dụng mật khẩu mới để đăng nhập lại.</p>

              <motion.button
                type="button"
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Quay lại đăng nhập
              </motion.button>
            </div>
          )}

          {stage === 'request' && (
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