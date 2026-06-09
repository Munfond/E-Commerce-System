import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, SlidersHorizontal, Star } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { products, type Product } from '../data/products';
import { categoryApi, type CategoryProductDto, type CategoryDto } from '../api/categoryApi';
import { IMAGE_BASE_URL } from '../api/config';
import { CATEGORY_IMAGE_BASE_URL } from '../api/config';
import { resolveImageUrl } from '../api/imageUrl';

// Construct proper image URL from file path
const constructImageUrl = (filePath: string): string => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
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
    rating: localProduct?.rating ?? 4.8, // Fallback rating nếu không có
    sold: localProduct?.sold ?? 0,
    category: localProduct?.category ?? defaultCategory,
    description: localProduct?.description ?? '',
  };
};

export default function ProductList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const [categories, setCategories] = useState<CategoryDto[]>([]);

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* SUB HEADER: THANH CHỌN DANH MỤC */}
        <div className="bg-white border-b border-slate-200 sticky top-32 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button className="flex items-center gap-1 px-4 py-2 border border-slate-300 rounded-sm hover:bg-slate-50 flex-shrink-0">
                <SlidersHorizontal className="size-4" />
                <span className="text-sm">Bộ lọc</span>
              </button>
              <button
                onClick={() => navigate('/products')}
                className={`px-4 py-2 text-sm rounded-sm flex-shrink-0 transition-colors ${
                  !selectedCategory ? 'bg-orange-600 text-white' : 'border border-slate-300 hover:bg-slate-50'
                }`}
              >
                Tất cả sản phẩm
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
                  <span className="flex items-center gap-2">
                    {category.image_url ? (
                      <img
                        src={resolveImageUrl(category.image_url, CATEGORY_IMAGE_BASE_URL)}
                        alt={category.name}
                        className="h-5 w-5 rounded-full object-cover border border-current/20"
                      />
                    ) : null}
                    <span>{category.name}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* THANH SẮP XẾP SẢN PHẨM */}
        <div className="bg-slate-100 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Sắp xếp theo</span>
              <div className="flex items-center gap-2">
                {['popular', 'latest', 'top-sales'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSortBy(type)}
                    className={`px-4 py-2 text-sm rounded-sm transition-colors ${
                      sortBy === type
                        ? 'bg-orange-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {type === 'popular' ? 'Phổ biến' : type === 'latest' ? 'Mới nhất' : 'Bán chạy'}
                  </button>
                ))}
                <div className="relative">
                  <select className="appearance-none bg-white border border-slate-300 pl-4 pr-10 py-2 text-sm rounded-sm outline-none cursor-pointer text-slate-700">
                    <option>Giá: Thấp đến cao</option>
                    <option>Giá: Cao đến thấp</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LƯỚI SẢN PHẨM */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {isLoadingCategory ? (
            <div className="text-center py-20 text-slate-500 text-sm">Đang tải sản phẩm...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {filteredProducts.map((product, index) => (
                /* 💡 Chuyển đổi thẻ button cũ thành Link chuyển trang trực tiếp */
                <Link
                  to={`/products/${product.id}`}
                  key={product.id}
                  className="group block bg-white border border-slate-100 hover:border-orange-500 hover:shadow-md transition-all rounded-sm overflow-hidden"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
                  >
                    <div className="relative aspect-square bg-slate-50 overflow-hidden">
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-[1.03] transition-transform duration-300"
                      />
                      {product.oldPrice && product.price && (
                        <div className="absolute top-0 right-0 bg-yellow-400 text-[10px] text-slate-900 px-1.5 py-0.5 font-bold rounded-bl-sm">
                          -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <h3 className="text-xs md:text-sm text-slate-800 mb-1 line-clamp-2 min-h-10 leading-relaxed group-hover:text-orange-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-2 mb-1">
                        <p className="text-orange-600 font-semibold text-sm md:text-base">{formatPrice(product.price)}</p>
                      </div>
                      {product.oldPrice && (
                        <p className="text-[11px] text-slate-400 line-through">{formatPrice(product.oldPrice)}</p>
                      )}
                      <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                        <div className="flex items-center gap-0.5 text-orange-500">
                          <Star className="size-3 fill-current" />
                          <span>{product.rating}</span>
                        </div>
                        <span>Đã bán {product.sold > 1000 ? `${(product.sold / 1000).toFixed(1)}k` : product.sold}</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}

          {/* THANH PHÂN TRANG */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <button className="px-4 py-2 text-sm border border-slate-300 rounded-sm hover:bg-slate-50 disabled:opacity-40" disabled>
              ‹ Trước
            </button>
            <button className="px-4 py-2 text-sm bg-orange-600 text-white rounded-sm font-medium">1</button>
            <button className="px-4 py-2 text-sm border border-slate-300 rounded-sm hover:bg-slate-50">2</button>
            <button className="px-4 py-2 text-sm border border-slate-300 rounded-sm hover:bg-slate-50">3</button>
            <button className="px-4 py-2 text-sm border border-slate-300 rounded-sm hover:bg-slate-50">
              Sau ›
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}