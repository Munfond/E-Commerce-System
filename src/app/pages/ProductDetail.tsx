import { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Star, Heart, Share2, Minus, Plus, ShoppingCart, ChevronRight, Loader2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../contexts/cart';
import { api } from '../api/client';
import { IMAGE_BASE_URL } from '../api/config';

// --- ĐỊNH NGHĨA INTERFACES THEO ĐÚNG JSON BACKEND ---
interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  stock: number;
  file_path: string;
  product_id: string;
  sale_price: number;
  input_price: number;
}

interface ProductImage {
  id: string;
  file_path: string;
  product_id: string;
  display_order: number;
}

interface ProductDetailData {
  id: string;
  shop_id: string;
  category_id: number;
  name: string;
  description: string; // Chuỗi chứa mã HTML <table> thông số
  brand: string;
  sold_count: number;
  slug: string;
  status: string;
  product_variants: ProductVariant[];
  product_images: ProductImage[];
}

interface ApiResponse {
  success: boolean;
  data: ProductDetailData;
}

const constructImageUrl = (filePath: string): string => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  return `${IMAGE_BASE_URL}${filePath}`;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // --- STATES QUẢN LÝ DỮ LIỆU ---
  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Gọi API lấy thông tin chi tiết sản phẩm
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get<ApiResponse>(`https://e-commerce-system-aq0y.onrender.com/api/v2/products/${id}`)
      .then((res) => {
        if (res.data?.success && res.data.data) {
          const productData = res.data.data;
          setProduct(productData);

          // Chọn biến thể đầu tiên còn hàng làm mặc định, nếu hết sạch thì lấy biến thể đầu tiên
          const defaultVariant = 
            productData.product_variants.find(v => v.stock > 0) || 
            productData.product_variants[0];
          
          setSelectedVariant(defaultVariant || null);

          // Cài đặt ảnh hiển thị chính mặc định (Ưu tiên ảnh của variant được chọn)
          if (defaultVariant?.file_path) {
            setActiveImage(constructImageUrl(defaultVariant.file_path));
          } else if (productData.product_images?.length > 0) {
            setActiveImage(constructImageUrl(productData.product_images[0].file_path));
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching product details:', err);
        toast.error('Không thể tải thông tin sản phẩm.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Gom toàn bộ ảnh hợp lệ (gồm ảnh gallery + ảnh của các variant) để làm bộ sưu tập thumbnails
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const imagesSet = new Set<string>();

    // Thêm ảnh từ album gallery chính trước (sắp xếp theo display_order)
    [...product.product_images]
      .sort((a, b) => a.display_order - b.display_order)
      .forEach((img) => imagesSet.add(constructImageUrl(img.file_path)));

    // Thêm ảnh từ các biến thể (nếu có ảnh riêng)
    product.product_variants.forEach((v) => {
      if (v.file_path) imagesSet.add(constructImageUrl(v.file_path));
    });

    return Array.from(imagesSet);
  }, [product]);

  // Xử lý đổi biến thể (variant) khi người dùng click chọn
  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setQuantity(1); // Reset số lượng về 1
    if (variant.file_path) {
      setActiveImage(constructImageUrl(variant.file_path));
    }
  };

  const formatPrice = (price: number) => {
    return '₫' + price.toLocaleString('vi-VN');
  };

  // --- THAO TÁC GIỎ HÀNG ---
  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    const success = await addToCart(selectedVariant.id, quantity);
    if (success) {
      toast.success('Đã thêm sản phẩm vào giỏ hàng thành công');
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;
    const success = await addToCart(selectedVariant.id, quantity);
    if (success) {
      navigate('/cart');
    }
  };

  // Trạng thái chờ tải dữ liệu (Loading)
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <Loader2 className="size-8 text-orange-600 animate-spin" />
          <p className="text-sm text-slate-500">Đang tải chi tiết sản phẩm...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Trạng thái lỗi không thấy sản phẩm
  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center text-center p-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Sản phẩm không tồn tại</h1>
            <p className="text-slate-600 mt-2">Vui lòng quay lại trang danh sách sản phẩm để lựa chọn.</p>
            <Link to="/products" className="inline-flex mt-4 rounded-sm bg-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-700 transition-colors">
              Quay về cửa hàng
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumbs dẫn đường điều hướng */}
        <div className="bg-white py-3 mb-4 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
              <Link to="/" className="hover:text-orange-600">ShopViet</Link>
              <ChevronRight className="size-3.5" />
              <Link to="/products" className="hover:text-orange-600">{product.brand || 'Danh mục'}</Link>
              <ChevronRight className="size-3.5" />
              <span className="text-slate-900 line-clamp-1">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-4">
            
            {/* CỘT TRÁI: HÌNH ẢNH SẢN PHẨM & GALLERY */}
            <div className="lg:col-span-5">
              <div className="bg-white p-4 rounded-sm shadow-sm">
                <div className="relative aspect-square bg-slate-50/50 border border-slate-100 rounded-sm overflow-hidden mb-3 flex items-center justify-center p-4">
                  <ImageWithFallback
                    src={activeImage}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-contain p-4 transition-all duration-300"
                  />
                </div>

                {/* Danh sách ảnh nhỏ Thumbnails */}
                <div className="grid grid-cols-5 gap-2 overflow-x-auto pb-1">
                  {galleryImages.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`relative aspect-square rounded-sm overflow-hidden border-2 transition-all flex-shrink-0 bg-white flex items-center justify-center p-1 ${
                      activeImage === imgUrl ? 'border-orange-600 scale-[0.98]' : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <ImageWithFallback
                      src={imgUrl}
                      alt={`Thumbnail ${index}`}
                      className="absolute inset-0 w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
                </div>

                <div className="flex items-center gap-5 mt-4 pt-4 border-t border-slate-100 justify-center md:justify-start">
                  <button className="flex items-center gap-2 text-slate-600 hover:text-orange-600 text-sm transition-colors">
                    <Share2 className="size-4" />
                    <span>Chia sẻ</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-600 hover:text-orange-600 text-sm transition-colors">
                    <Heart className="size-4" />
                    <span>Đã thích (0)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: CHI TIẾT BIẾN THỂ, GIÁ CẢ & ĐẶT HÀNG */}
            <div className="lg:col-span-7">
              <div className="bg-white p-6 rounded-sm shadow-sm h-full">
                <div className="flex items-start gap-2 mb-2">
                  <span className="bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase flex-shrink-0 mt-1">Yêu thích</span>
                  <h1 className="text-lg md:text-xl font-medium text-slate-900 leading-snug">{product.name}</h1>
                </div>

                {/* Đánh giá & Số lượng đã bán */}
                <div className="flex items-center gap-4 mb-4 text-sm pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-1 text-orange-600 font-medium">
                    <span className="border-b border-orange-500">4.9</span>
                    <div className="flex ms-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="size-3.5 fill-orange-400 text-orange-400" />
                      ))}
                    </div>
                  </div>
                  <div className="border-l border-slate-200 pl-4 text-slate-500">
                    <span className="text-slate-800 border-b border-slate-600 font-medium">{product.sold_count}</span> Đánh giá
                  </div>
                  <div className="border-l border-slate-200 pl-4 text-slate-500">
                    <span className="text-slate-800 font-medium">{product.sold_count}</span> Đã bán
                  </div>
                </div>

                {/* Khung Giá (Thay đổi động theo variant được chọn) */}
                <div className="bg-slate-50 px-5 py-4 rounded-sm mb-6 flex items-baseline gap-3">
                  <span className="text-2xl md:text-3xl text-orange-600 font-bold tracking-tight">
                    {selectedVariant ? formatPrice(selectedVariant.sale_price) : 'Liên hệ'}
                  </span>
                </div>

                {/* PHẦN CHỌN CÁC BIẾN THỂ (PRODUCT VARIANTS) */}
                <div className="mb-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <span className="text-slate-500 text-sm w-24 pt-2 flex-shrink-0">Phân loại</span>
                    <div className="flex flex-wrap gap-2 flex-1">
                      {product.product_variants.map((v) => {
                        const isSelected = selectedVariant?.id === v.id;
                        const isOutOfStock = v.stock === 0;

                        return (
                          <button
                            key={v.id}
                            disabled={isOutOfStock}
                            onClick={() => handleVariantChange(v)}
                            className={`px-4 py-2 border text-xs md:text-sm transition-all rounded-sm font-medium position-relative ${
                              isSelected
                                ? 'border-orange-600 text-orange-600 bg-orange-50/10 shadow-sm'
                                : 'border-slate-200 text-slate-800 bg-white hover:border-slate-300'
                            } ${isOutOfStock ? 'opacity-40 bg-slate-100 border-dashed border-slate-300 cursor-not-allowed text-slate-400' : ''}`}
                          >
                            {v.name}
                            {isOutOfStock && <span className="text-[9px] block font-normal text-rose-500">(Hết hàng)</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bộ điều khiển Số lượng mua */}
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500 text-sm w-24 flex-shrink-0">Số lượng</span>
                    <div className="flex items-center">
                      <div className="flex items-center border border-slate-200 rounded-sm bg-white">
                        <button
                          disabled={quantity <= 1 || selectedVariant?.stock === 0}
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="size-8 hover:bg-slate-50 flex items-center justify-center text-slate-500 disabled:opacity-30"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <input
                          type="text"
                          value={selectedVariant?.stock === 0 ? 0 : quantity}
                          readOnly
                          className="w-12 h-8 text-center text-sm font-medium border-x border-slate-200 outline-none bg-slate-50/20"
                        />
                        <button
                          disabled={!selectedVariant || quantity >= selectedVariant.stock}
                          onClick={() => setQuantity(quantity + 1)}
                          className="size-8 hover:bg-slate-50 flex items-center justify-center text-slate-500 disabled:opacity-30"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="ml-4 text-slate-500 text-xs md:text-sm">
                        {selectedVariant ? `${selectedVariant.stock} sản phẩm có sẵn` : '0 sản phẩm có sẵn'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* HỆ THỐNG NÚT THAO TÁC MUA HÀNG */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!selectedVariant || selectedVariant.stock === 0}
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-orange-600 text-orange-600 bg-orange-50/30 hover:bg-orange-50 transition-colors rounded-sm font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="size-4" />
                    <span>Thêm vào giỏ hàng</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={!selectedVariant || selectedVariant.stock === 0}
                    className="flex-1 bg-orange-600 text-white py-3 hover:bg-orange-700 transition-colors rounded-sm font-semibold text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
                  >
                    Mua ngay
                  </button>
                </div>

                {/* Chính sách đi kèm cố định */}
                <div className="border-t border-slate-100 mt-6 pt-5 space-y-3 text-xs md:text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 w-28 flex-shrink-0">Vận chuyển</span>
                    <span className="text-slate-800 font-medium">Miễn phí vận chuyển toàn quốc</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 w-28 flex-shrink-0">Chính sách bảo hành</span>
                    <span className="text-slate-800">Bảo hành 12 tháng chính hãng từ nhà sản xuất</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 w-28 flex-shrink-0">Trả hàng / Hoàn tiền</span>
                    <span className="text-slate-800">Đổi trả miễn phí nhanh chóng trong vòng 7 ngày</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* KHU VỰC DƯỚI: THÔNG SỐ KỸ THUẬT VÀ MÔ TẢ CHI TIẾT SẢN PHẨM */}
          <div className="bg-white mt-4 p-6 rounded-sm shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase bg-slate-50 px-4 py-3 tracking-wider rounded-sm">
              Thông số kỹ thuật chi tiết
            </h2>
            
            {/* 💡 Render trực tiếp bảng HTML cấu hình siêu mượt mà */}
            <div 
              className="product-specs-container text-sm text-slate-700 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}