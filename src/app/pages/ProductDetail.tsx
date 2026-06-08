import { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Star, Heart, Share2, Minus, Plus, ShoppingCart, ChevronRight, Loader2, Store, MessageSquare } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../contexts/cart';
import { api } from '../api/client';
import { IMAGE_BASE_URL } from '../api/config';

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
  description: string;
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

interface ShopAddress {
  city: string;
  ward: string;
  details: string;
}

// 💡 CẬP NHẬT: shop_addresses trả về từ Supabase luôn là một MẢNG
interface ShopInfoData {
  id: string;
  shop_name: string;
  shop_logo: string | null;
  shop_description: string;
  rating: number;
  created_at: string;
  shop_addresses?: ShopAddress[]; // Thay đổi thành mảng []
}

interface ShopApiResponse {
  success: boolean;
  data: ShopInfoData;
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

  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [shop, setShop] = useState<ShopInfoData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
  console.log("=== ĐÃ VÀO USEEFFECT ===");
  console.log("Giá trị Product ID lấy từ URL useParams là:", id);

  if (!id) {
    console.warn("🛑 Không gọi API vì biến 'id' đang bị undefined hoặc trống!");
    return;
  }

  setLoading(true);
  
  // 1. Gọi API Product riêng biệt
  api
    .get<ApiResponse>(`https://e-commerce-system-aq0y.onrender.com/api/v2/products/${id}`)
    .then((res) => {

      if (res.data?.success) {
        const productData = res.data.data || res.data; 
        setProduct(productData);

        const defaultVariant = productData.product_variants?.find((v: any) => v.stock > 0) || productData.product_variants?.[0];
        setSelectedVariant(defaultVariant || null);

        if (defaultVariant?.file_path) {
          setActiveImage(constructImageUrl(defaultVariant.file_path));
        } else if (productData.product_images?.length > 0) {
          setActiveImage(constructImageUrl(productData.product_images[0].file_path));
        }

        // Kiểm tra xem có shop_id không

        if (productData?.shop_id) {
          // 2. Tiến hành gọi API Shop độc lập tại đây để không phụ thuộc luồng return
          api.get<ShopApiResponse>(`https://e-commerce-system-aq0y.onrender.com/api/v1/shops/${productData.shop_id}`)
            .then((shopRes) => {
              if (shopRes?.data?.success) {
                const shopData = shopRes.data.data || shopRes.data;
                setShop(shopData);
              } else {
                console.warn("⚠️ API Shop trả về success = false:", shopRes?.data);
              }
            })
            .catch((shopErr) => {
              console.error("❌ Lỗi riêng khi gọi API Shop:", shopErr);
            });
        } else {
          console.warn("⚠️ Sản phẩm này không chứa trường 'shop_id' để gọi cửa hàng!");
        }

      } else {
        console.warn("⚠️ API Product trả về success = false");
      }
    })
    .catch((err) => {
      console.error('❌ Lỗi khi gọi API Product:', err);
      toast.error('Không thể tải thông tin chi tiết.');
    })
    .finally(() => {
      setLoading(false);
    });
}, [id]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const imagesSet = new Set<string>();

    [...product.product_images]
      .sort((a, b) => a.display_order - b.display_order)
      .forEach((img) => imagesSet.add(constructImageUrl(img.file_path)));

    product.product_variants.forEach((v) => {
      if (v.file_path) imagesSet.add(constructImageUrl(v.file_path));
    });

    return Array.from(imagesSet);
  }, [product]);

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setQuantity(1);
    if (variant.file_path) {
      setActiveImage(constructImageUrl(variant.file_path));
    }
  };

  const formatPrice = (price: number) => {
    return '₫' + price.toLocaleString('vi-VN');
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart(selectedVariant.id, quantity);
    toast.success('Đã thêm sản phẩm vào giỏ hàng thành công');
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return;
    addToCart(selectedVariant.id, quantity);
    navigate('/cart');
  };

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

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center text-center p-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Sản phẩm không tồn tại</h1>
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

      <main className="flex-1 pb-16">
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
            
            {/* CỘT TRÁI: HÌNH ẢNH */}
            <div className="lg:col-span-5">
              <div className="bg-white p-4 rounded-sm shadow-sm">
                <div className="relative aspect-square bg-slate-50/50 border border-slate-100 rounded-sm overflow-hidden mb-3 flex items-center justify-center p-4">
                  <ImageWithFallback
                    src={activeImage}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-contain p-4 transition-all duration-300"
                  />
                </div>

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
              </div>
            </div>

            {/* CỘT PHẢI: CHI TIẾT SẢN PHẨM & ĐẶT HÀNG */}
            <div className="lg:col-span-7">
              <div className="bg-white p-6 rounded-sm shadow-sm h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-2 mb-2">
                    <span className="bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase mt-1">Yêu thích</span>
                    <h1 className="text-lg md:text-xl font-medium text-slate-900 leading-snug">{product.name}</h1>
                  </div>

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
                      Đã bán <span className="text-slate-800 font-medium">{product.sold_count}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 px-5 py-4 rounded-sm mb-6 flex items-baseline gap-3">
                    <span className="text-2xl md:text-3xl text-orange-600 font-bold tracking-tight">
                      {selectedVariant ? formatPrice(selectedVariant.sale_price) : 'Liên hệ'}
                    </span>
                  </div>

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
                              className={`px-4 py-2 border text-xs md:text-sm transition-all rounded-sm font-medium ${
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

                    <div className="flex items-center gap-4">
                      <span className="text-slate-500 text-sm w-24 flex-shrink-0">Số lượng</span>
                      <div className="flex items-center">
                        <div className="flex items-center border border-slate-200 rounded-sm bg-white">
                          <button
                            disabled={quantity <= 1 || selectedVariant?.stock === 0}
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="size-8 hover:bg-slate-50 flex items-center justify-center text-slate-500"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <input
                            type="text"
                            value={selectedVariant?.stock === 0 ? 0 : quantity}
                            readOnly
                            className="w-12 h-8 text-center text-sm font-medium outline-none"
                          />
                          <button
                            disabled={!selectedVariant || quantity >= selectedVariant.stock}
                            onClick={() => setQuantity(quantity + 1)}
                            className="size-8 hover:bg-slate-50 flex items-center justify-center text-slate-500"
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
                </div>

                <div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={!selectedVariant || selectedVariant.stock === 0}
                      className="flex items-center justify-center gap-2 px-6 py-3 border border-orange-600 text-orange-600 bg-orange-50/30 hover:bg-orange-50 transition-colors rounded-sm font-medium text-sm disabled:opacity-40"
                    >
                      <ShoppingCart className="size-4" />
                      <span>Thêm vào giỏ hàng</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      disabled={!selectedVariant || selectedVariant.stock === 0}
                      className="flex-1 bg-orange-600 text-white py-3 hover:bg-orange-700 transition-colors rounded-sm font-semibold text-sm uppercase tracking-wider"
                    >
                      Mua ngay
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* 🏪 KHU VỰC THÔNG TIN CỬA HÀNG */}
          {shop && (
            <div className="bg-white mt-4 p-6 rounded-sm shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center border border-slate-100">
              <div className="flex items-center gap-4 md:border-r md:border-slate-100 md:pr-6">
                <div className="size-16 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-400">
                  {shop.shop_logo ? (
                    <img src={constructImageUrl(shop.shop_logo)} alt={shop.shop_name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="size-8 text-slate-400" />
                  )}
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="font-semibold text-slate-900 text-base line-clamp-1">{shop.shop_name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{shop.shop_description || 'Chưa có mô tả.'}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button 
                      onClick={() => navigate(`/shops/${shop.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-700 text-xs rounded-sm hover:bg-slate-50 transition-colors"
                    >
                      <Store className="size-3.5" /> Xem Shop
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* KHU VỰC DƯỚI: MÔ TẢ CHI TIẾT SẢN PHẨM */}
          <div className="bg-white mt-4 p-6 rounded-sm shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase bg-slate-50 px-4 py-3 tracking-wider rounded-sm">
              Thông số kỹ thuật chi tiết
            </h2>
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