import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Laptop, Watch, Headphones, Camera, Speaker, Package, Zap, Shirt, Home as HomeIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { categoryApi, type CategoryDto } from '../api/categoryApi';
import { resolveImageUrl } from '../api/imageUrl';
import { CATEGORY_IMAGE_BASE_URL } from '../api/config';
import banner1 from '../../assets/images/banner1.jpg';
import banner2 from '../../assets/images/banner2.jpg';
import banner3 from '../../assets/images/banner3.jpg';
import type { CategoryProductDto } from '../api/categoryApi';

type FeaturedProduct = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  sold: number;
};

const defaultCategories = [
  { name: 'Điện Thoại & Phụ Kiện', slug: 'dien-thoai-phu-kien', icon: Smartphone },
  { name: 'Máy Tính & Laptop', slug: 'may-tinh-laptop', icon: Laptop },
  { name: 'Đồng Hồ', slug: 'dong-ho', icon: Watch },
  { name: 'Máy Ảnh', slug: 'may-anh', icon: Camera },
  { name: 'Âm Thanh', slug: 'am-thanh', icon: Headphones },
  { name: 'Loa', slug: 'loa', icon: Speaker },
  { name: 'Thời Trang Nam', slug: 'thoi-trang-nam', icon: Shirt },
  { name: 'Thời Trang Nữ', slug: 'thoi-trang-nu', icon: Shirt },
  { name: 'Nhà Cửa & Đời Sống', slug: 'nha-cua-doi-song', icon: HomeIcon },
  { name: 'Thiết Bị Điện Tử', slug: 'thiet-bi-dien-tu', icon: Zap },
];

const categoryIconMap: Record<string, typeof Smartphone> = {
  'dien-thoai-phu-kien': Smartphone,
  'may-tinh-laptop': Laptop,
  'dong-ho': Watch,
  'may-anh': Camera,
  'am-thanh': Headphones,
  loa: Speaker,
  'thoi-trang-nam': Shirt,
  'thoi-trang-nu': Shirt,
  'nha-cua-doi-song': HomeIcon,
  'thiet-bi-dien-tu': Zap,
};

const mapFeaturedProduct = (product: CategoryProductDto): FeaturedProduct => {
  const firstVariant = product.product_variants?.[0];
  const imagePath = product.product_images?.[0]?.file_path ?? '';

  return {
    id: product.id,
    name: product.name,
    price: firstVariant?.sale_price ?? 0,
    oldPrice: undefined,
    image: resolveImageUrl(imagePath),
    sold: 0,
  };
};

export default function Home() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [featuredCategoryName, setFeaturedCategoryName] = useState('');
  const [featuredCategoryId, setFeaturedCategoryId] = useState<number | null>(null);

  const banners = [
    banner1,
    banner2,
    banner3,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    categoryApi
      .getCategories()
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setCategories(response.data);
        }
      })
      .catch(() => {
        // keep default categories if the API request fails
      });
  }, []);

  useEffect(() => {
    if (featuredCategoryId !== null || categories.length === 0) return;

    const eligibleCategories = categories.filter((category) => category.id >= 1 && category.id <= 9);
    const pool = eligibleCategories.length > 0 ? eligibleCategories : categories;
    if (pool.length === 0) return;

    const randomCategory = pool[Math.floor(Math.random() * pool.length)];
    setFeaturedCategoryId(randomCategory.id);
    setFeaturedCategoryName(randomCategory.name);
  }, [categories, featuredCategoryId]);

  useEffect(() => {
    if (featuredCategoryId === null) return;

    let alive = true;
    categoryApi
      .getCategoryProducts(String(featuredCategoryId))
      .then((response) => {
        if (!alive) return;
        const items = Array.isArray(response.data?.data) ? response.data.data : [];
        setFeaturedProducts(items.slice(0, 6).map(mapFeaturedProduct));
      })
      .catch(() => {
        if (!alive) return;
        setFeaturedProducts([]);
      });

    return () => {
      alive = false;
    };
  }, [featuredCategoryId]);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-white py-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-9 relative group">
                <div className="aspect-[2.5/1] bg-gradient-to-r from-orange-400 to-pink-500 rounded-sm overflow-hidden relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentBanner}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-full"
                    >
                      <ImageWithFallback
                        src={banners[currentBanner]}
                        alt="Banner"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <button
                  onClick={prevBanner}
                  className="absolute left-4 top-1/2 -translate-y-1/2 size-10 bg-white/80 hover:bg-white rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="size-6 text-slate-700" />
                </button>

                <button
                  onClick={nextBanner}
                  className="absolute right-4 top-1/2 -translate-y-1/2 size-10 bg-white/80 hover:bg-white rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="size-6 text-slate-700" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentBanner(index)}
                      className={`h-2 rounded-full transition-all ${
                        currentBanner === index ? 'bg-white w-8' : 'bg-white/50 w-2'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="col-span-12 lg:col-span-3 grid grid-rows-2 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-sm overflow-hidden">
                  <ImageWithFallback
                    src={banner2}
                    alt="Promo 1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-sm overflow-hidden">
                  <ImageWithFallback
                    src={banner3}
                    alt="Promo 2"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-6 mt-6">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-slate-500 text-sm uppercase mb-4">DANH MỤC</h2>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
              {categories.map((category, index) => {
                const Icon = categoryIconMap[category.slug] ?? Package;
                const categoryImage = resolveImageUrl(category.image_url ?? null, CATEGORY_IMAGE_BASE_URL);
                return (
                  <Link to={`/products?category=${category.id}`} key={category.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="text-center"
                    >
                      <div className="aspect-square border-2 border-slate-200 rounded-sm mb-2 flex items-center justify-center overflow-hidden bg-slate-50 hover:border-orange-500 hover:shadow-md transition-all">
                        {categoryImage ? (
                          <ImageWithFallback
                            src={categoryImage}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Icon className="size-8 text-orange-600" strokeWidth={1.5} />
                        )}
                      </div>
                      <p className="text-xs text-slate-700 line-clamp-2">{category.name}</p>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-8 mt-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-500 text-sm uppercase">
                GỢI Ý HÔM NAY{featuredCategoryName ? ` - ${featuredCategoryName}` : ''}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {featuredProducts.map((product, index) => (
                <Link to={`/products/${product.id}`} key={product.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all"
                  >
                    <div className="relative aspect-square bg-slate-50 overflow-hidden">
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.oldPrice && (
                        <div className="absolute top-0 right-0 bg-yellow-400 text-xs px-2 py-1 font-semibold">
                          GIẢM 10%
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <h3 className="text-sm text-slate-900 mb-1 line-clamp-2 min-h-10">{product.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <p className="text-orange-600 font-medium">₫{product.price.toLocaleString('vi-VN')}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span>4.8</span>
                        </div>
                        <span>Đã bán {product.sold}</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link to="/products">
                <button className="border border-slate-300 text-slate-700 px-12 py-3 hover:bg-slate-50 transition-colors">
                  Xem thêm
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
