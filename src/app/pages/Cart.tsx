import { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Trash2, Plus, Minus, Ticket, ShoppingBag, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../contexts/cart';
import { useAuth } from '../auth/AuthProvider';
import { orderApi } from '../api/orderApi';
import { IMAGE_BASE_URL } from '../api/config';

const constructImageUrl = (filePath: string): string => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  return `${IMAGE_BASE_URL}${filePath}`;
};

export default function Cart() {
  const { cartData, isLoading, refreshCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const auth = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.user) {
      refreshCart();
    }
  }, [auth.user]);

  // Phẳng hóa danh sách item từ tất cả các shop để làm payload gửi lên API
  const allCartItems = useMemo(() => {
    return cartData.shops.flatMap((shop) => shop.items);
  }, [cartData.shops]);

  // Xử lý thanh toán TOÀN BỘ giỏ hàng
  const handleCheckout = async () => {
    if (allCartItems.length === 0) return;

    // Lấy toàn bộ item đang có trong giỏ hàng không chừa một ai
    const cartItemsPayload = allCartItems.map((item) => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
    }));

    setIsCreatingOrder(true);
    setOrderError(null);

    try {
      const response = await orderApi.createCustomerOrder({
        cart_items: cartItemsPayload,
        payment_method: paymentMethod,
      });
      
      toast.success(`Đơn hàng đã tạo thành công! Tổng ${formatPrice(response.data.total)}`);

      // Thanh toán xong thì xóa sạch giỏ hàng luôn
      await clearCart();
      navigate('/orders');
    } catch (error) {
      setOrderError('Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const formatPrice = (price: number) => {
    return '₫' + price.toLocaleString('vi-VN');
  };

  if (!isLoading && cartData.shops.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="size-32 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="size-16 text-slate-400" />
            </div>
            <h2 className="text-2xl font-medium text-slate-900 mb-2">Giỏ hàng của bạn còn trống</h2>
            <p className="text-slate-600 mb-6">Hãy chọn thêm sản phẩm để mua sắm nhé</p>
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-orange-600 text-white px-8 py-3 hover:bg-orange-700 transition-colors"
              >
                Mua ngay
              </motion.button>
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        <div className="grid lg:grid-cols-12 gap-4">
          
          {/* CỘT TRÁI: HIỂN THỊ DANH SÁCH ITEM CHIA THEO SHOP (KHÔNG CHECKBOX) */}
          <div className="lg:col-span-9 space-y-4">
            
            {/* Header thông báo danh mục */}
            <div className="bg-white flex items-center gap-4 p-4 border-b border-slate-200 shadow-sm rounded-sm">
              <span className="flex-1 text-slate-900 font-medium">Danh sách sản phẩm mua ({cartData.cart_total_items_count})</span>
              <span className="w-32 text-center text-slate-600 hidden md:block">Đơn Giá</span>
              <span className="w-32 text-center text-slate-600 hidden md:block">Số Lượng</span>
              <span className="w-32 text-center text-slate-600 hidden md:block">Thành Tiền</span>
              <span className="w-16 text-center text-slate-600 hidden md:block">Xóa</span>
            </div>

            {/* Duyệt qua từng Shop */}
            {cartData.shops.map((shop) => (
              <div key={shop.shop_id} className="bg-white shadow-sm rounded-sm overflow-hidden">
                
                {/* Header Tên Shop */}
                <div className="bg-slate-50/70 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <Store className="size-4 text-slate-700" />
                  <span className="font-semibold text-slate-800 text-sm">{shop.shop_name}</span>
                  {shop.shop_logo && (
                    <img
                      src={constructImageUrl(shop.shop_logo)}
                      alt={shop.shop_name}
                      className="size-5 rounded-full object-cover border border-slate-200"
                    />
                  )}
                </div>

                {/* Danh sách sản phẩm của Shop đó */}
                <div className="divide-y divide-slate-100">
                  {shop.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-slate-50/50">
                      
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="size-20 bg-slate-50 border border-slate-100 flex-shrink-0 rounded">
                          <ImageWithFallback
                            src={constructImageUrl(item.file_path)}
                            alt={item.product_name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm text-slate-900 line-clamp-2 font-medium mb-1">{item.product_name}</h3>
                          <div className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-sm">
                            Phân loại: {item.variant_name}
                          </div>
                        </div>
                      </div>

                      {/* Đơn giá */}
                      <div className="w-32 text-center hidden md:block">
                        <span className="text-slate-900 text-sm">{formatPrice(item.price)}</span>
                      </div>

                      {/* Bộ nút tăng giảm số lượng */}
                      <div className="w-32 flex justify-center flex-shrink-0">
                        <div className="flex items-center border border-slate-200 rounded bg-white">
                          <button
                            disabled={item.quantity <= 1}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="size-8 hover:bg-slate-50 flex items-center justify-center text-slate-500 disabled:opacity-30"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <input
                            type="text"
                            value={item.quantity}
                            readOnly
                            className="w-10 h-8 text-center text-sm font-medium border-x border-slate-200 outline-none bg-slate-50/30"
                          />
                          <button
                            disabled={item.quantity >= item.stock}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="size-8 hover:bg-slate-50 flex items-center justify-center text-slate-500 disabled:opacity-30"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Thành tiền */}
                      <div className="w-32 text-center hidden md:block">
                        <span className="text-orange-600 font-semibold text-sm">{formatPrice(item.subtotal)}</span>
                      </div>

                      {/* Nút Xóa */}
                      <div className="w-16 text-center hidden md:block">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="size-4.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="md:hidden text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="size-4.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Tạm tính riêng từng shop */}
                <div className="bg-slate-50/30 px-4 py-2 border-t border-slate-50 text-end text-xs text-slate-500">
                  Tạm tính Shop: <span className="font-medium text-slate-700">{formatPrice(shop.shop_subtotal)}</span>
                </div>
              </div>
            ))}

            {/* Mã giảm giá */}
            <div className="bg-white p-4 flex items-center gap-4 shadow-sm rounded-sm">
              <Ticket className="size-5 text-orange-600 flex-shrink-0" />
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Nhập mã giảm giá hệ thống"
                className="flex-1 px-4 py-2 border border-slate-200 text-sm outline-none focus:border-orange-600 transition-colors"
              />
              <button className="px-6 py-2 text-sm border border-orange-600 text-orange-600 hover:bg-orange-50 transition-colors font-medium">
                Áp dụng
              </button>
            </div>
          </div>

          {/* CỘT PHẢI: HOÁ ĐƠN TỔNG GIỎ HÀNG (STICKY BOX) */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 shadow-sm rounded-sm sticky top-24">
              <h3 className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-4">Giao tới</h3>
              <div className="mb-4 pb-4 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900 mb-1">Trịnh Ngô Vương An | 0987654321</p>
                <p className="text-xs text-slate-600 leading-relaxed">Đại học Bách Khoa Hà Nội (HUST), Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội</p>
              </div>

              <div className="space-y-3 mb-4 pb-4 border-b border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tạm tính giỏ hàng</span>
                  {/* 💡 Lấy trực tiếp từ cart_total_price của server trả về luôn */}
                  <span className="text-slate-900 font-medium">{formatPrice(cartData.cart_total_price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Giảm giá hệ thống</span>
                  <span className="text-green-600 font-medium">-₫0</span>
                </div>
                
                <div className="space-y-2 pt-2">
                  <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Phương thức thanh toán</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-600 transition-colors"
                  >
                    <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                    <option value="card">Thẻ tín dụng / Thẻ ghi nợ</option>
                    <option value="vnpay">Ví điện tử VNPay / MoMo</option>
                  </select>
                </div>
              </div>

              {/* Tổng thanh toán cuối cùng */}
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-sm font-medium text-slate-900">Tổng tiền</span>
                <div className="text-right">
                  <p className="text-2xl text-orange-600 font-bold tracking-tight">{formatPrice(cartData.cart_total_price)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">(Đã bao gồm thuế, phí nếu có)</p>
                </div>
              </div>

              {orderError && (
                <div className="mb-4 rounded border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
                  {orderError}
                </div>
              )}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={allCartItems.length === 0 || isCreatingOrder}
                className="w-full bg-orange-600 text-white py-3 font-semibold text-sm hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider rounded-sm shadow-sm"
              >
                {isCreatingOrder ? `Đang tạo đơn...` : `Mua Tất Cả (${cartData.cart_total_items_count})`}
              </button>
            </motion.div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}