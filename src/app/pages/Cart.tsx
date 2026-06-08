import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trash2, Plus, Minus, Ticket, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../contexts/cart';
import { api } from '../api/client';
import { endpoints } from '../api/endpoints';
import { useAuth } from '../auth/AuthProvider';
import { orderApi } from '../api/orderApi';
import { IMAGE_BASE_URL } from '../api/config';

// Construct proper image URL from file path
const constructImageUrl = (filePath: string): string => {
  if (!filePath) return '';
  // If it's already a full URL, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  // Otherwise, construct the URL from the file path
  return `${IMAGE_BASE_URL}${filePath}`;
};

export default function Cart() {
  const { items: cartItems, updateQuantity, removeFromCart } = useCart();
  const auth = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [selectAll, setSelectAll] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Array<number | string>>([]);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.user) {
      setIsLoadingCart(true);
      api
        .get<{ cart: { items: unknown[] } }>(endpoints.customer.cart)
        .then(() => {
          // Successfully fetched cart, items are already in local cart context
        })
        .catch(() => {
          // Ignore errors, use local cart as fallback
        })
        .finally(() => {
          setIsLoadingCart(false);
        });
    }
  }, [auth.user]);

  useEffect(() => {
    setSelectedItems(cartItems.map((item) => item.product.id));
    setSelectAll(cartItems.length > 0);
  }, [cartItems]);

  const toggleSelectItem = (id: number | string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedItems, id];
      setSelectedItems(newSelected);
      if (newSelected.length === cartItems.length) {
        setSelectAll(true);
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.product.id));
    }
    setSelectAll(!selectAll);
  };

  const selectedItemsTotal = cartItems
    .filter((item) => selectedItems.includes(item.product.id))
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (selectedItems.length === 0) return;

    const cartItemsPayload = cartItems
      .filter((item) => selectedItems.includes(item.product.id))
      .map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

    if (cartItemsPayload.length === 0) {
      setOrderError('Vui lòng chọn sản phẩm để thanh toán.');
      return;
    }

    setIsCreatingOrder(true);
    setOrderError(null);

    try {
      const response = await orderApi.createCustomerOrder({
        cart_items: cartItemsPayload,
        payment_method: paymentMethod,
      });
      toast.success(`Đơn hàng ${response.data.id} đã tạo thành công! Tổng ${formatPrice(response.data.total)}`);

      if (selectedItems.length === cartItems.length) {
        clearCart();
      } else {
        selectedItems.forEach((id) => removeFromCart(id));
      }

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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
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
          <div className="lg:col-span-9">
            <div className="bg-white">
              <div className="flex items-center gap-4 p-4 border-b border-slate-200">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="size-5 accent-orange-600 cursor-pointer"
                />
                <span className="flex-1 text-slate-900">Sản Phẩm</span>
                <span className="w-32 text-center text-slate-600 hidden md:block">Đơn Giá</span>
                <span className="w-32 text-center text-slate-600 hidden md:block">Số Lượng</span>
                <span className="w-32 text-center text-slate-600 hidden md:block">Số Tiền</span>
                <span className="w-16 text-center text-slate-600 hidden md:block">Thao Tác</span>
              </div>

              {cartItems.map((item, index) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 border-b border-slate-100 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.product.id)}
                    onChange={() => toggleSelectItem(item.product.id)}
                    className="size-5 accent-orange-600 cursor-pointer flex-shrink-0"
                  />

                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="size-20 bg-slate-100 flex-shrink-0">
                      <ImageWithFallback
                        src={constructImageUrl(item.product.image)}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm text-slate-900 line-clamp-2 mb-1">{item.product.name}</h3>
                      <p className="text-xs text-slate-500">{item.product.description}</p>
                    </div>
                  </div>

                  <div className="w-32 text-center hidden md:block">
                    <span className="text-slate-900">{formatPrice(item.product.price)}</span>
                  </div>

                  <div className="w-32 flex justify-center">
                    <div className="flex items-center border border-slate-300">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="size-8 hover:bg-slate-100 flex items-center justify-center"
                      >
                        <Minus className="size-4" />
                      </button>
                      <input
                        type="text"
                        value={item.quantity}
                        readOnly
                        className="w-12 h-8 text-center border-x border-slate-300 outline-none"
                      />
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="size-8 hover:bg-slate-100 flex items-center justify-center"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="w-32 text-center hidden md:block">
                    <span className="text-orange-600 font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>

                  <div className="w-16 text-center hidden md:block">
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="md:hidden text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="size-5" />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="bg-white mt-4 p-4 flex items-center gap-4">
              <Ticket className="size-5 text-orange-600" />
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Nhập mã giảm giá"
                className="flex-1 px-4 py-2 border border-slate-300 outline-none focus:border-orange-600"
              />
              <button className="px-6 py-2 border border-orange-600 text-orange-600 hover:bg-orange-50 transition-colors">
                Áp dụng
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 sticky top-24"
            >
              <h3 className="text-slate-600 mb-4">Giao tới</h3>
              <div className="mb-4 pb-4 border-b border-slate-200">
                <p className="text-sm text-slate-900 mb-1">Nguyễn Văn A | 0123456789</p>
                <p className="text-sm text-slate-600">123 Đường ABC, Phường XYZ, Quận 1, TP.HCM</p>
              </div>

              <div className="space-y-3 mb-4 pb-4 border-b border-slate-200">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tạm tính</span>
                  <span className="text-slate-900">{formatPrice(selectedItemsTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Giảm giá</span>
                  <span className="text-slate-900">-₫0</span>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-600">Phương thức thanh toán</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-600"
                  >
                    <option value="cod">Tiền mặt khi nhận hàng</option>
                    <option value="card">Thẻ tín dụng / ghi nợ</option>
                    <option value="online">Ví điện tử</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between mb-4">
                <span className="text-slate-900">Tổng tiền</span>
                <div className="text-right">
                  <p className="text-2xl text-orange-600 font-medium">{formatPrice(selectedItemsTotal)}</p>
                  <p className="text-xs text-slate-500">(Đã bao gồm VAT nếu có)</p>
                </div>
              </div>

              {orderError && (
                <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {orderError}
                </div>
              )}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={selectedItems.length === 0 || isCreatingOrder}
                className="w-full bg-orange-600 text-white py-3 hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingOrder ? `Đang tạo đơn...` : `Mua Hàng (${selectedItems.length})`}
              </button>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
