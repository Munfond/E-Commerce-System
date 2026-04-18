import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import iphoneImage from '../../assets/images/iphone.jpg';
import macbookProImage from '../../assets/images/macbook-pro.jpg';
import iphone15Image from '../../assets/images/iphone15.jpg';
import ps5Image from '../../assets/images/ps5.jpg';
import ipadImage from '../../assets/images/ipad.jpg';
import watchImage from '../../assets/images/watch.jpg';
import airpodsMaxImage from '../../assets/images/airpods-max.jpg';
import iphone14Image from '../../assets/images/iphone14.jpg';
import macbookAirImage from '../../assets/images/macbook-air.jpg';
import ipadAirImage from '../../assets/images/ipad-air.jpg';
import airpodsProImage from '../../assets/images/airpods-pro.jpg';
import iphone15PlusImage from '../../assets/images/iphone15-plus.jpg';

const products = [
  {
    id: 1,
    name: 'iPhone 16 Pro Max Titan Tự Nhiên 256GB',
    price: 34990000,
    oldPrice: 36990000,
    image: iphoneImage,
    rating: 4.8,
    sold: 1200,
  },
  {
    id: 2,
    name: 'MacBook Pro M3 14 inch 2024 512GB',
    price: 48990000,
    image: macbookProImage,
    rating: 4.9,
    sold: 890,
  },
  {
    id: 3,
    name: 'iPhone 15 Pro 128GB VN/A Chính Hãng',
    price: 24990000,
    oldPrice: 28990000,
    image: iphone15Image,
    rating: 4.7,
    sold: 2300,
  },
  {
    id: 4,
    name: 'Gaming Setup Pro Console PlayStation 5',
    price: 15990000,
    image: ps5Image,
    rating: 4.6,
    sold: 450,
  },
  {
    id: 5,
    name: 'iPad Pro M2 11 inch WiFi 128GB 2024',
    price: 32990000,
    oldPrice: 35990000,
    image: ipadImage,
    rating: 4.8,
    sold: 670,
  },
  {
    id: 6,
    name: 'Apple Watch Series 9 GPS 41mm Aluminum',
    price: 12990000,
    image: watchImage,
    rating: 4.7,
    sold: 980,
  },
  {
    id: 7,
    name: 'AirPods Max Over-Ear Headphones',
    price: 13490000,
    oldPrice: 14990000,
    image: airpodsMaxImage,
    rating: 4.9,
    sold: 1500,
  },
  {
    id: 8,
    name: 'iPhone 14 Pro 128GB Chính Hãng VN/A',
    price: 19990000,
    oldPrice: 24990000,
    image: iphone14Image,
    rating: 4.6,
    sold: 3400,
  },
  {
    id: 9,
    name: 'MacBook Air M3 13 inch 256GB 2024',
    price: 28990000,
    oldPrice: 31990000,
    image: macbookAirImage,
    rating: 4.8,
    sold: 1100,
  },
  {
    id: 10,
    name: 'iPad Air M2 11 inch WiFi 256GB Chính Hãng',
    price: 18990000,
    image: ipadAirImage,
    rating: 4.7,
    sold: 820,
  },
  {
    id: 11,
    name: 'AirPods Pro Gen 2 USB-C Chính Hãng Apple',
    price: 6490000,
    oldPrice: 6990000,
    image: airpodsProImage,
    rating: 4.9,
    sold: 2200,
  },
  {
    id: 12,
    name: 'iPhone 15 Plus 128GB Chính Hãng VN/A',
    price: 22990000,
    oldPrice: 25990000,
    image: iphone15PlusImage,
    rating: 4.7,
    sold: 1600,
  },
];

const categories = ['Điện thoại', 'Laptop', 'Tablet', 'Đồng hồ', 'Tai nghe', 'Phụ kiện'];

export default function ProductList() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const formatPrice = (price: number) => {
    return '₫' + price.toLocaleString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header cartCount={3} />

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
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-sm rounded-sm flex-shrink-0 transition-colors ${
                    selectedCategory === category
                      ? 'bg-orange-600 text-white'
                      : 'border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {category}
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
            {products.map((product, index) => (
              <Link to={`/products/${product.id}`} key={product.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
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
                        <span className="text-yellow-400">★</span>
                        <span>{product.rating}</span>
                      </div>
                      <span>Đã bán {product.sold > 1000 ? `${(product.sold/1000).toFixed(1)}k` : product.sold}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
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
    </div>
  );
}
