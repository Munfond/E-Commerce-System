import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Star, ShoppingCart, Loader2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../components/ui/dialog';
import { useCart } from '../contexts/cart';
import { searchProductsByKeyword, type CustomerProductDto } from '../api/productApi';
import { IMAGE_BASE_URL } from '../api/config';

export type Product = {
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

const mapSearchProduct = (product: CustomerProductDto): Product => {
  // Extract price from first variant
  const price = product.product_variants?.[0]?.sale_price ?? 0;
  const oldPrice = product.product_variants?.[0]?.input_price ?? undefined;

  // Extract first image path and construct full URL
  const imagePath = product.product_images?.[0]?.file_path ?? '';
  const imageUrl = constructImageUrl(imagePath);

  return {
    id: product.id,
    name: product.name,
    price,
    oldPrice,
    image: imageUrl,
    rating: 4,
    sold: 0,
    category: `Danh mục ${product.category_id}`,
    description: product.name,
  };
};

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [keyword, setKeyword] = useState('');
  const { addToCart, buyNow } = useCart();

  // Fetch search results when keyword or page changes
  const fetchSearchResults = (searchKeyword: string, page: number) => {
    if (!searchKeyword.trim()) {
      setSearchResults([]);
      setTotalPages(1);
      setTotalResults(0);
      return;
    }

    setIsLoading(true);
    searchProductsByKeyword(searchKeyword, page, 20)
      .then((response) => {
        console.log('Search response:', response);
        // Response structure: { data: { success, data, pagination }, status, headers, requestId }
        const apiData = response.data;
        if (apiData?.success && Array.isArray(apiData.data)) {
          const items = apiData.data.map((item) => mapSearchProduct(item));
          setSearchResults(items);
          setTotalPages(apiData.pagination?.pages ?? 1);
          setTotalResults(apiData.pagination?.total ?? 0);
        } else {
          console.warn('Invalid response structure:', apiData);
          setSearchResults([]);
          setTotalPages(1);
          setTotalResults(0);
        }
      })
      .catch((err) => {
        console.error('Search error:', err);
        setSearchResults([]);
        setTotalPages(1);
        setTotalResults(0);
        toast.error('Lỗi khi tìm kiếm sản phẩm');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Handle search keyword from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') ?? '';
    setKeyword(query);
    setCurrentPage(1);
    fetchSearchResults(query, 1);
  }, [location.search]);

  // Handle page changes
  useEffect(() => {
    if (keyword && currentPage > 1) {
      fetchSearchResults(keyword, currentPage);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const handleProductClick = (product: Product) => {
    setActiveProduct(product);
    setOpen(true);
  };

  const handleAddToCart = () => {
    if (activeProduct) {
      addToCart({
        id: activeProduct.id,
        name: activeProduct.name,
        price: activeProduct.price,
        image: activeProduct.image,
        quantity: 1,
      });
      setOpen(false);
      toast.success('Thêm vào giỏ hàng thành công');
    }
  };

  const handleBuyNow = () => {
    if (activeProduct) {
      buyNow({
        id: activeProduct.id,
        name: activeProduct.name,
        price: activeProduct.price,
        image: activeProduct.image,
        quantity: 1,
      });
      navigate('/cart');
    }
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return '₫0';
    return '₫' + price.toLocaleString('vi-VN');
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
            >
              <ChevronLeft className="size-4" />
              Quay lại
            </button>
            <h1 className="text-3xl font-bold text-slate-900">
              Kết quả tìm kiếm: <span className="text-orange-600">"{keyword}"</span>
            </h1>
            {!isLoading && searchResults.length > 0 && (
              <p className="text-slate-600 mt-2">
                Tìm thấy <span className="font-semibold">{totalResults}</span> sản phẩm
                {totalPages > 1 && ` - Trang ${currentPage}/${totalPages}`}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="size-8 text-orange-600 animate-spin" />
                <p className="text-slate-600">Đang tìm kiếm...</p>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {searchResults.map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ y: -4 }}
                    onClick={() => handleProductClick(product)}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  >
                    <div className="relative overflow-hidden bg-slate-100 h-56">
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-semibold">
                        Mới
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm mb-2">{product.name}</h3>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3.5 ${
                                i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-600">({product.sold})</span>
                      </div>

                      <div className="flex items-end gap-2 mb-4">
                        <div className="text-lg font-bold text-orange-600">{formatPrice(product.price)}</div>
                        {product.oldPrice && product.oldPrice > product.price && (
                          <div className="text-xs line-through text-slate-500">{formatPrice(product.oldPrice)}</div>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product);
                        }}
                        className="w-full h-9 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="size-4" />
                        Xem chi tiết
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <div className="text-slate-600 text-sm">
                    Trang {currentPage} / {totalPages}
                  </div>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-slate-400 text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy sản phẩm</h2>
              <p className="text-slate-600 mb-6">
                Rất tiếc, không có sản phẩm nào khớp với từ khóa tìm kiếm của bạn. Hãy thử tìm kiếm từ khóa khác.
              </p>
              <Link
                to="/"
                className="inline-block px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Quay về trang chủ
              </Link>
            </div>
          )}
        </div>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{activeProduct?.name}</DialogTitle>
            <DialogDescription>{activeProduct?.category}</DialogDescription>
          </DialogHeader>
          {activeProduct && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-100 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={activeProduct.image}
                  alt={activeProduct.name}
                  className="w-full h-64 object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < Math.floor(activeProduct.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold text-orange-600 mb-1">{formatPrice(activeProduct.price)}</div>
                  {activeProduct.oldPrice && activeProduct.oldPrice > activeProduct.price && (
                    <div className="text-lg line-through text-slate-500">{formatPrice(activeProduct.oldPrice)}</div>
                  )}
                </div>
                <p className="text-slate-600 text-sm mb-6">{activeProduct.description || activeProduct.name}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">
                Đóng
              </button>
            </DialogClose>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              className="px-4 py-2 rounded-lg border border-orange-600 text-orange-600 hover:bg-orange-50"
            >
              Thêm vào giỏ
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBuyNow}
              className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
            >
              Mua ngay
            </motion.button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}
