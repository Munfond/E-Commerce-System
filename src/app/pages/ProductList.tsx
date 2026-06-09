import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, SlidersHorizontal, Star } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { categoryApi, type CategoryProductDto, type CategoryDto } from '../api/categoryApi';
import { CATEGORY_IMAGE_BASE_URL } from '../api/config';
import { resolveImageUrl } from '../api/imageUrl';
import { listCustomerProducts, type CustomerProductDto } from '../api/productApi';

type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  sold: number;
  category: string;
  description: string;
};

const PAGE_SIZE = 24;

const constructImageUrl = (filePath: string): string => resolveImageUrl(filePath);

const mapCategoryProduct = (product: CategoryProductDto, defaultCategory: string): Product => {
  // Extract price from first variant
  const price = product.product_variants?.[0]?.sale_price ?? 0;

  // Extract first image path and construct full URL
  const imagePath = product.product_images?.[0]?.file_path ?? '';
  const imageUrl = constructImageUrl(imagePath);

  return {
    id: product.id,
    name: product.name,
    price,
    oldPrice: undefined,
    image: imageUrl,
    rating: 4.8,
    sold: 0,
    category: defaultCategory,
    description: '',
  };
};

const mapAllProduct = (product: CustomerProductDto, categories: CategoryDto[]): Product => {
  const price = product.product_variants?.[0]?.sale_price ?? 0;
  const oldPrice = product.product_variants?.[0]?.input_price ?? undefined;
  const imagePath = product.product_images?.[0]?.file_path ?? product.product_variants?.[0]?.file_path ?? '';
  const imageUrl = constructImageUrl(imagePath);
  const categoryName = categories.find((category) => String(category.id) === String(product.category_id))?.name ?? `Danh mục ${product.category_id}`;

  return {
    id: product.id,
    name: product.name,
    price,
    oldPrice,
    image: imageUrl,
    rating: 4.8,
    sold: 0,
    category: categoryName,
    description: product.name,
  };
};

export default function ProductList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

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
    const nextPage = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
    setCurrentPage(nextPage);

    if (!queryCategoryId) {
      setSelectedCategory('');
      setIsLoading(true);
      listCustomerProducts(nextPage, PAGE_SIZE)
        .then((response) => {
          const items = Array.isArray(response.data?.data) ? response.data.data : [];
          setAllProducts(items.map((item) => mapAllProduct(item, categories)));
          setTotalPages(response.data?.pagination?.pages ?? 1);
          setTotalProducts(response.data?.pagination?.total ?? items.length);
        })
        .catch(() => {
          setAllProducts([]);
          setTotalPages(1);
          setTotalProducts(0);
        })
        .finally(() => {
          setIsLoading(false);
        });
      setCategoryProducts([]);
      return;
    }

    const category = categories.find((cat) => String(cat.id) === queryCategoryId);
    const categoryName = category?.name ?? '';
    setSelectedCategory(categoryName);

    setIsLoading(true);
    categoryApi
      .getCategoryProducts(queryCategoryId, nextPage, PAGE_SIZE)
      .then((response) => {
        const items = Array.isArray(response.data?.data)
          ? response.data.data.map((item) => mapCategoryProduct(item, categoryName))
          : [];
        setCategoryProducts(items);
        setTotalPages(response.data?.pagination?.pages ?? 1);
        setTotalProducts(response.data?.pagination?.total ?? items.length);
      })
      .catch(() => {
        setCategoryProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [location.search, categories]);

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return '₫0';
    return '₫' + price.toLocaleString('vi-VN');
  };

  const effectiveProducts = selectedCategory ? categoryProducts : allProducts;
  const filteredProducts = effectiveProducts
    .filter((product) => product.price !== undefined && product.price !== null)
    .filter((product) =>
      selectedCategory ? product.category === selectedCategory : true
    );

  const paginationWindow = 2;
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => {
    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= paginationWindow;
  });

  const updatePage = (page: number) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', String(page));
    navigate({ pathname: '/products', search: `?${searchParams.toString()}` });
  };

  const navigateCategory = (categoryId?: number) => {
    const searchParams = new URLSearchParams();
    if (categoryId != null) {
      searchParams.set('category', String(categoryId));
    }
    searchParams.set('page', '1');
    navigate({ pathname: '/products', search: `?${searchParams.toString()}` });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* SUB HEADER: THANH CHỌN DANH MỤC */}
        <div className="bg-white border-b border-slate-200 sticky top-28 md:top-32 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button className="flex items-center gap-1 px-4 py-2 border border-slate-300 rounded-sm hover:bg-slate-50 flex-shrink-0">
                <SlidersHorizontal className="size-4" />
                <span className="text-sm">Bộ lọc</span>
              </button>
              <button
                onClick={() => navigateCategory()}
                className={`px-4 py-2 text-sm rounded-sm flex-shrink-0 transition-colors ${
                  !selectedCategory ? 'bg-orange-600 text-white' : 'border border-slate-300 hover:bg-slate-50'
                }`}
              >
                Tất cả sản phẩm
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => navigateCategory(category.id)}
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
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <span className="text-sm text-slate-600">Sắp xếp theo</span>
              <div className="flex flex-wrap items-center gap-2">
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
                <div className="relative w-full sm:w-auto">
                  <select className="appearance-none w-full sm:w-auto bg-white border border-slate-300 pl-4 pr-10 py-2 text-sm rounded-sm outline-none cursor-pointer text-slate-700">
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
          {isLoading ? (
            <div className="text-center py-20 text-slate-500 text-sm">Đang tải sản phẩm...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
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
          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => updatePage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm border border-slate-300 rounded-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ‹ Trước
              </button>

              {pageNumbers.map((page, index) => {
                const previousPage = pageNumbers[index - 1];
                const shouldShowEllipsis = index > 0 && previousPage !== undefined && page - previousPage > 1;

                return (
                  <span key={page} className="flex items-center gap-2">
                    {shouldShowEllipsis ? <span className="px-2 text-slate-400">...</span> : null}
                    <button
                      type="button"
                      onClick={() => updatePage(page)}
                      className={`min-w-10 px-4 py-2 text-sm rounded-sm border transition-colors ${
                        currentPage === page
                          ? 'bg-orange-600 text-white border-orange-600 font-medium'
                          : 'border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  </span>
                );
              })}

              <button
                type="button"
                onClick={() => updatePage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm border border-slate-300 rounded-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sau ›
              </button>
              <div className="w-full text-center text-xs text-slate-500 mt-2">
                Hiển thị {filteredProducts.length} / {totalProducts} sản phẩm
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}