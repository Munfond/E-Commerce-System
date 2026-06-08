import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Loader2, Store, Star, Calendar, MapPin, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { api } from '../api/client';
import { IMAGE_BASE_URL } from '../api/config';

// --- INTERFACES ---
interface ShopAddress {
  city: string;
  ward: string;
  details: string;
}

interface ShopData {
  id: string;
  shop_name: string;
  shop_logo: string | null;
  shop_description: string;
  rating: number;
  created_at: string;
  shop_addresses?: ShopAddress[];
}

interface ShopResponse {
  success: boolean;
  data: ShopData;
}

interface ProductItemData {
  id: string;
  name: string;
  brand: string;
  sold_count: number;
  category_id: number;
  product_images: { file_path: string }[];
}

interface ProductsResponse {
  success: boolean;
  products: ProductItemData[];
}

const constructImageUrl = (filePath: string): string => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  return `${IMAGE_BASE_URL}${filePath}`;
};

// 💡 COMPONENT CON: Tự động fetch giá tiền thật của từng sản phẩm
function ProductCard({ prod }: { prod: ProductItemData }) {
  const [realPrice, setRealPrice] = useState<number | null>(null);

  useEffect(() => {
    // Gọi API chi tiết v2 để bóc tách mảng variants lấy giá sale_price thực tế
    api.get(`https://e-commerce-system-aq0y.onrender.com/api/v2/products/${prod.id}`)
      .then((res) => {
        if (res.data?.success) {
          const detailedData = res.data.data;
          const variants = detailedData?.product_variants || [];
          if (variants.length > 0) {
            const prices = variants.map((v: any) => v.sale_price);
            setRealPrice(Math.min(...prices));
          }
        }
      })
      .catch((err) => console.error(`Không thể lấy giá cho sản phẩm ${prod.id}:`, err));
  }, [prod.id]);

  const thumbImage = prod.product_images?.[0]?.file_path;

  return (
    <Link
      to={`/products/${prod.id}`}
      className="bg-white rounded-sm border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all flex flex-col justify-between overflow-hidden group"
    >
      <div className="relative aspect-square bg-slate-50 overflow-hidden flex items-center justify-center p-2">
        <ImageWithFallback
          src={constructImageUrl(thumbImage || '')}
          alt={prod.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <p className="text-xs text-slate-400 font-medium">
            {prod.brand === '(None)' || !prod.brand ? 'Thương hiệu OEM' : prod.brand}
          </p>
          <h3 className="text-sm text-slate-800 font-normal line-clamp-2 group-hover:text-orange-600 transition-colors min-h-[40px] leading-tight">
            {prod.name}
          </h3>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-orange-600">
            {realPrice ? `₫${realPrice.toLocaleString('vi-VN')}` : <Loader2 className="size-3 animate-spin text-slate-400" />}
          </span>
          <span className="text-[11px] text-slate-400">
            Đã bán {prod.sold_count || 0}
          </span>
        </div>
      </div>
    </Link>
  );
}

// --- MAIN COMPONENT ---
export default function ShopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState<ShopData | null>(null);
  const [products, setProducts] = useState<ProductItemData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      api.get<ShopResponse>(`https://e-commerce-system-aq0y.onrender.com/api/v1/shops/${id}`),
      api.get<ProductsResponse>(`https://e-commerce-system-aq0y.onrender.com/api/v2/products/shops/${id}`)
    ])
      .then(([shopRes, productsRes]) => {
        if (shopRes?.data?.success) {
          setShop(shopRes.data.data || shopRes.data);
        }
        if (productsRes?.data?.success && Array.isArray(productsRes.data.products)) {
          setProducts(productsRes.data.products);
        } else {
          setProducts([]);
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải dữ liệu Shop:', err);
        toast.error('Không thể tải thông tin cửa hàng.');
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <Loader2 className="size-8 text-orange-600 animate-spin" />
          <p className="text-sm text-slate-500">Đang tải thông tin cửa hàng...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center text-center p-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Cửa hàng không tồn tại</h1>
            <button onClick={() => navigate(-1)} className="mt-4 rounded-sm bg-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-700 transition-colors">
              Quay lại trang trước
            </button>
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
        {/* KHU VỰC THÔNG TIN BANNER CỬA HÀNG */}
        <div className="bg-slate-900 text-white py-8 px-4 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-center">
            <div className="size-24 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 flex-shrink-0 flex items-center justify-center">
              {shop.shop_logo ? (
                <img src={constructImageUrl(shop.shop_logo)} alt={shop.shop_name} className="w-full h-full object-cover" />
              ) : (
                <Store className="size-12 text-slate-300" />
              )}
            </div>

            <div className="space-y-2 text-center md:text-left flex-1">
              <h1 className="text-xl md:text-2xl font-bold tracking-wide">{shop.shop_name}</h1>
              <p className="text-sm text-slate-300 max-w-2xl line-clamp-2">
                {shop.shop_description || 'Chưa có thông tin giới thiệu cụ thể về cửa hàng này.'}
              </p>
              
            </div>
          </div>
        </div>

        {/* KHU VỰC DANH SÁCH SẢN PHẨM CỦA SHOP */}
        <div className="max-w-7xl mx-auto px-4 mt-8">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-200">
            <ShoppingBag className="size-5 text-orange-600" />
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Tất cả sản phẩm ({products.length})</h2>
          </div>

          {products.length === 0 ? (
            <div className="bg-white text-center py-16 rounded-sm border border-slate-100 shadow-sm">
              <ShoppingBag className="size-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Cửa hàng hiện tại chưa đăng bán sản phẩm nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((prod) => (
                // 💡 SỬ DỤNG COMPONENT CON: Mỗi sản phẩm tự quản lý việc lấy giá để tránh hiển thị chữ "Liên hệ"
                <ProductCard key={prod.id} prod={prod} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}