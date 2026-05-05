import { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Heart, Share2, Minus, Plus, ShoppingCart, MessageCircle, ChevronRight } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../contexts/cart';
import { products, type Product } from '../data/products';

const colors = [
  { name: 'Titan Tự Nhiên', color: '#E8E6E3' },
  { name: 'Titan Đen', color: '#3B3B3D' },
  { name: 'Titan Trắng', color: '#F5F5F0' },
  { name: 'Titan Xanh', color: '#566063' },
];

const storages = ['256GB', '512GB', '1TB'];

export default function ProductDetail() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, buyNow } = useCart();
  const navigate = useNavigate();
  const params = useParams();
  const productId = Number(params.id);
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center text-center p-6">
          <div>
            <h1 className="text-2xl font-semibold">Sản phẩm không tồn tại</h1>
            <p className="text-slate-600 mt-2">Vui lòng quay lại trang sản phẩm để chọn sản phẩm khác.</p>
            <Link to="/products" className="inline-flex mt-4 rounded-lg bg-orange-600 px-5 py-3 text-white hover:bg-orange-700">
              Quay về cửa hàng
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const productImages = [product.image, product.image, product.image];

  const formatPrice = (price: number) => {
    return '₫' + price.toLocaleString('vi-VN');
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleBuyNow = () => {
    buyNow(product, quantity);
    toast.success('Mua ngay thành công');
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="bg-white py-4 mb-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Link to="/" className="hover:text-orange-600">ShopViet</Link>
              <ChevronRight className="size-4" />
              <Link to="/products" className="hover:text-orange-600">Điện thoại</Link>
              <ChevronRight className="size-4" />
              <span className="text-slate-900">iPhone 16 Pro Max</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5">
              <div className="bg-white p-4">
                <div className="aspect-square bg-slate-50 rounded-sm overflow-hidden mb-4">
                  <ImageWithFallback
                    src={productImages[selectedImage]}
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-sm overflow-hidden border-2 ${
                        selectedImage === index ? 'border-orange-600' : 'border-transparent hover:border-slate-300'
                      }`}
                    >
                      <ImageWithFallback
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200">
                  <button className="flex items-center gap-2 text-slate-700 hover:text-orange-600">
                    <Share2 className="size-5" />
                    <span className="text-sm">Chia sẻ</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-700 hover:text-orange-600">
                    <Heart className="size-5" />
                    <span className="text-sm">Đã thích (2.3k)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white p-6">
                <div className="flex items-start gap-2 mb-2">
                  <span className="bg-orange-600 text-white text-xs px-2 py-1">Yêu thích</span>
                  <h1 className="text-xl text-slate-900 flex-1">iPhone 16 Pro Max Titan Tự Nhiên 256GB - Chính hãng VN/A</h1>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <span className="text-orange-600 border-b border-orange-600">{(4.8).toFixed(1)}</span>
                    <div className="flex ml-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="size-4 fill-orange-400 text-orange-400" />
                      ))}
                    </div>
                  </div>
                  <div className="border-l border-slate-300 pl-4">
                    <span className="text-slate-600 border-b border-slate-600">1.2k</span>
                    <span className="text-slate-600 ml-1">Đánh giá</span>
                  </div>
                  <div className="border-l border-slate-300 pl-4">
                    <span className="text-slate-900">1.2k</span>
                    <span className="text-slate-600 ml-1">Đã bán</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl text-orange-600 font-medium">{formatPrice(product.price)}</span>
                    {product.oldPrice && (
                      <span className="text-slate-400 line-through text-lg">{formatPrice(product.oldPrice)}</span>
                    )}
                    {product.oldPrice && (
                      <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-sm">
                        -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% GIẢM
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-slate-600 w-28">Màu sắc</span>
                    <div className="flex gap-2">
                      {colors.map((color, index) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(index)}
                          className={`px-4 py-2 border rounded-sm text-sm transition-all ${
                            selectedColor === index
                              ? 'border-orange-600 text-orange-600'
                              : 'border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {color.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-slate-600 w-28">Dung lượng</span>
                    <div className="flex gap-2">
                      {storages.map((storage, index) => (
                        <button
                          key={storage}
                          onClick={() => setSelectedStorage(index)}
                          className={`px-6 py-2 border rounded-sm text-sm transition-all ${
                            selectedStorage === index
                              ? 'border-orange-600 text-orange-600'
                              : 'border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {storage}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-slate-600 w-28">Số lượng</span>
                    <div className="flex items-center">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="size-8 border border-slate-300 hover:bg-slate-50 flex items-center justify-center"
                      >
                        <Minus className="size-4" />
                      </button>
                      <input
                        type="text"
                        value={quantity}
                        readOnly
                        className="w-14 h-8 border-t border-b border-slate-300 text-center outline-none"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="size-8 border border-slate-300 hover:bg-slate-50 flex items-center justify-center"
                      >
                        <Plus className="size-4" />
                      </button>
                      <span className="ml-4 text-slate-600 text-sm">2.450 sản phẩm có sẵn</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 transition-colors rounded-sm"
                  >
                    <ShoppingCart className="size-5" />
                    <span className="font-medium">Thêm vào giỏ hàng</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="flex-1 bg-orange-600 text-white py-3 hover:bg-orange-700 transition-colors rounded-sm font-medium"
                  >
                    Mua ngay
                  </button>
                </div>

                <div className="border-t border-slate-200 mt-6 pt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-slate-600 w-32">Vận chuyển</span>
                    <div>
                      <p className="text-slate-900">Miễn phí vận chuyển</p>
                      <p className="text-slate-500">Giao hàng toàn quốc</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-slate-600 w-32">Bảo hành</span>
                    <p className="text-slate-900">Bảo hành chính hãng 12 tháng</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-slate-600 w-32">Chính sách đổi trả</span>
                    <p className="text-slate-900">Đổi trả miễn phí trong 7 ngày</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white mt-4 p-6">
            <h2 className="text-lg text-slate-900 mb-4 uppercase bg-slate-50 p-3">Chi tiết sản phẩm</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex">
                <span className="text-slate-500 w-40">Thương hiệu</span>
                <span className="text-slate-900">Apple</span>
              </div>
              <div className="flex">
                <span className="text-slate-500 w-40">Xuất xứ</span>
                <span className="text-slate-900">Trung Quốc</span>
              </div>
              <div className="flex">
                <span className="text-slate-500 w-40">Màn hình</span>
                <span className="text-slate-900">6.7" Super Retina XDR</span>
              </div>
              <div className="flex">
                <span className="text-slate-500 w-40">Chip</span>
                <span className="text-slate-900">A18 Pro</span>
              </div>
              <div className="flex">
                <span className="text-slate-500 w-40">Camera</span>
                <span className="text-slate-900">48MP + 12MP + 12MP</span>
              </div>
              <div className="flex">
                <span className="text-slate-500 w-40">Pin</span>
                <span className="text-slate-900">4422 mAh</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="font-medium text-slate-900 mb-3">Mô tả sản phẩm</h3>
              <div className="text-sm text-slate-700 space-y-2">
                <p>iPhone 16 Pro Max - Đỉnh cao công nghệ với chip A18 Pro mạnh mẽ, camera 48MP chuyên nghiệp và màn hình Super Retina XDR 6.7 inch tuyệt đẹp.</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Chip A18 Pro - Hiệu năng vượt trội, xử lý mọi tác vụ mượt mà</li>
                  <li>Hệ thống camera Pro với cảm biến 48MP, chụp ảnh chuyên nghiệp</li>
                  <li>Màn hình Super Retina XDR 6.7 inch, độ sáng lên đến 2000 nits</li>
                  <li>Khung viền Titan cao cấp, bền bỉ và nhẹ hơn</li>
                  <li>Pin trọn ngày, sạc nhanh không dây MagSafe</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
