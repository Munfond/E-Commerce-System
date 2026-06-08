import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, SlidersHorizontal, Star, ShoppingCart } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../components/ui/dialog';
import { useCart } from '../contexts/cart';
import { products, type Product } from '../data/products';
import { categoryApi, type CategoryProductDto, type CategoryDto } from '../api/categoryApi';
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

const mapCategoryProduct = (product: CategoryProductDto, defaultCategory: string): Product => {
  // Extract price from first variant
  const price = product.product_variants?.[0]?.sale_price ?? 0;

  // Extract first image path and construct full URL
  const imagePath = product.product_images?.[0]?.file_path ?? '';
  const imageUrl = constructImageUrl(imagePath);
  
  const localProduct = products.find(
    (item) => String(item.id) === String(product.id) || item.name === product.name
  );

  return {
    id: product.id,
    name: product.name,
    price,
    oldPrice: localProduct?.oldPrice,
    image: imageUrl,
    rating: localProduct?.rating ?? 0,
    sold: localProduct?.sold ?? 0,
    category: localProduct?.category ?? defaultCategory,
    description: localProduct?.description ?? '',
  };
};

export default function ProductList() {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [open, setOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const { addToCart, buyNow } = useCart();
  const navigate = useNavigate();

  // Fetch categories from API on mount
  useEffect(() => {
    categoryApi
      .getCategories()
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setCategories(response.data);
        }
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryCategoryId = searchParams.get('category') ?? '';

    if (!queryCategoryId) {
      setSelectedCategory('');
      setCategoryProducts([]);
      return;
    }

    // Find category name from fetched categories
    const category = categories.find((cat) => String(cat.id) === queryCategoryId);
    const categoryName = category?.name ?? '';
    setSelectedCategory(categoryName);

    setIsLoadingCategory(true);
    categoryApi
      .getCategoryProducts(queryCategoryId)
      .then((response) => {
        const items = Array.isArray(response.data?.data)
          ? response.data.data.map((item) => mapCategoryProduct(item, categoryName))
          : [];
        setCategoryProducts(items);
      })
      .catch(() => {
        setCategoryProducts([]);
      })
      .finally(() => {
        setIsLoadingCategory(false);
      });
  }, [location.search, categories]);

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return '₫0';
    return '₫' + price.toLocaleString('vi-VN');
  };

  const effectiveProducts = categoryProducts.length > 0 ? categoryProducts : products;
  const filteredProducts = effectiveProducts
    .filter((product) => product.price !== undefined && product.price !== null)
    .filter((product) =>
      selectedCategory ? product.category === selectedCategory : true
    );

  const handleOpenProduct = (product: Product) => {
    setActiveProduct(product);
    setOpen(true);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleBuyNow = (product: Product) => {
    buyNow(product, 1);
    toast.success('Mua ngay thành công');
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="bg-white border-b border-slate-200 sticky top-32 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button className="flex items-center gap-1 px-4 py-2 border border-slate-300 rounded-sm hover:bg-slate-50 flex-shrink-0">
                <SlidersHorizontal className="size-4" />
                <span className="text-sm">Bộ lọc</span>
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => navigate(`/products?category=${category.id}`)}
                  className={`px-4 py-2 text-sm rounded-sm flex-shrink-0 transition-colors ${
                    selectedCategory === category.name
                      ? 'bg-orange-600 text-white'
                      : 'border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-100 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Sắp xếp theo</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSortBy('popular')}
                  className={`px-4 py-2 text-sm rounded-sm ${
                    sortBy === 'popular'
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Phổ biến
                </button>
                <button
                  onClick={() => setSortBy('latest')}
                  className={`px-4 py-2 text-sm rounded-sm ${
                    sortBy === 'latest'
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Mới nhất
                </button>
                <button
                  onClick={() => setSortBy('top-sales')}
                  className={`px-4 py-2 text-sm rounded-sm ${
                    sortBy === 'top-sales'
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Bán chạy
                </button>
                <div className="relative">
                  <select className="appearance-none bg-white border border-slate-300 pl-4 pr-10 py-2 text-sm rounded-sm outline-none cursor-pointer">
                    <option>Giá: Thấp đến cao</option>
                    <option>Giá: Cao đến thấp</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {filteredProducts.map((product, index) => (
              <button
                type="button"
                onClick={() => handleOpenProduct(product)}
                key={product.id}
                className="text-left"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="bg-white border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all w-full"
                >
                  <div className="relative aspect-square bg-slate-50 overflow-hidden">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.oldPrice && product.price && (
                      <div className="absolute top-0 right-0 bg-yellow-400 text-xs px-2 py-1 font-semibold">
                        -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="text-sm text-slate-900 mb-1 line-clamp-2 min-h-10">{product.name}</h3>
                    <div className="flex items-baseline gap-2 mb-1">
                      <p className="text-orange-600 font-medium text-base">{formatPrice(product.price)}</p>
                    </div>
                    {product.oldPrice && (
                      <p className="text-xs text-slate-400 line-through">{formatPrice(product.oldPrice)}</p>
                    )}
                    <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Star className="size-3 text-yellow-400" />
                        <span>{product.rating}</span>
                      </div>
                      <span>Đã bán {product.sold > 1000 ? `${(product.sold / 1000).toFixed(1)}k` : product.sold}</span>
                    </div>
                  </div>
                </motion.div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-8">
            <button className="px-4 py-2 border border-slate-300 rounded-sm hover:bg-slate-50 disabled:opacity-50" disabled>
              ‹ Trước
            </button>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-sm">1</button>
            <button className="px-4 py-2 border border-slate-300 rounded-sm hover:bg-slate-50">2</button>
            <button className="px-4 py-2 border border-slate-300 rounded-sm hover:bg-slate-50">3</button>
            <button className="px-4 py-2 border border-slate-300 rounded-sm hover:bg-slate-50">
              Sau ›
            </button>
          </div>
        </div>
      </main>

      <Footer />

      <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
        <DialogContent className="max-w-3xl p-0">
          {activeProduct && (
            <div className="grid lg:grid-cols-2 gap-0 lg:gap-6">
              <div className="bg-slate-50 p-4 lg:p-6">
                <div className="aspect-square bg-white rounded-xl overflow-hidden mb-4">
                  <ImageWithFallback
                    src={activeProduct.image}
                    alt={activeProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-4 justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{activeProduct.name}</h2>
                    <p className="text-sm text-slate-500 mt-2">{activeProduct.category}</p>
                  </div>
                  <DialogClose className="text-slate-500 hover:text-slate-900">✕</DialogClose>
                </div>
              </div>
              <div className="bg-white p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-semibold text-orange-600">{formatPrice(activeProduct.price)}</span>
                    {activeProduct.oldPrice && (
                      <span className="text-sm text-slate-400 line-through">{formatPrice(activeProduct.oldPrice)}</span>
                    )}
                  </div>
                  <div className="space-y-3 text-sm text-slate-600 mb-6">
                    <p>{activeProduct.description}</p>
                    <p>
                      <span className="font-medium text-slate-900">Đã bán:</span> {activeProduct.sold}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Đánh giá:</span> {activeProduct.rating} ★
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(activeProduct)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-orange-600 px-4 py-3 text-orange-600 hover:bg-orange-50 transition-colors"
                  >
                    <ShoppingCart className="size-4" />
                    Thêm vào giỏ hàng
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBuyNow(activeProduct)}
                    className="w-full rounded-lg bg-orange-600 px-4 py-3 text-white hover:bg-orange-700 transition-colors"
                  >
                    Mua ngay
                  </button>
                  <Link
                    to={`/products/${activeProduct.id}`}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Xem trang sản phẩm
                  </Link>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
