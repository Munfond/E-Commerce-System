import { motion } from 'motion/react';
import { Home, Search } from 'lucide-react';
import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
          <div className="size-32 bg-slate-200 rounded-full mx-auto flex items-center justify-center">
            <Search className="size-16 text-slate-400" />
          </div>
        </motion.div>

        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Không tìm thấy trang
        </h2>
        <p className="text-slate-600 mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Home className="size-5" />
              Về trang chủ
            </motion.button>
          </Link>
          <Link to="/products">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 border-2 border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-semibold hover:border-slate-400 transition-colors"
            >
              <Search className="size-5" />
              Xem sản phẩm
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
