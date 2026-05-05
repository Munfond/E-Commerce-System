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

export type Product = {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  sold: number;
  category: string;
  description: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: 'iPhone 16 Pro Max Titan Tự Nhiên 256GB',
    price: 34990000,
    oldPrice: 36990000,
    image: iphoneImage,
    rating: 4.8,
    sold: 1200,
    category: 'Điện thoại',
    description: 'Màn hình Super Retina XDR, chip A18 Pro, camera nâng cao, và pin dung lượng lớn cho trải nghiệm mượt mà.',
  },
  {
    id: 2,
    name: 'MacBook Pro M3 14 inch 2024 512GB',
    price: 48990000,
    image: macbookProImage,
    rating: 4.9,
    sold: 890,
    category: 'Laptop',
    description: 'MacBook Pro mạnh mẽ với chip M3, màn hình Liquid Retina XDR và hiệu năng đồ họa xuất sắc.',
  },
  {
    id: 3,
    name: 'iPhone 15 Pro 128GB VN/A Chính Hãng',
    price: 24990000,
    oldPrice: 28990000,
    image: iphone15Image,
    rating: 4.7,
    sold: 2300,
    category: 'Điện thoại',
    description: 'Thiết kế tinh tế, hiệu năng xử lý cao và camera Pro cho ảnh chụp chuyên nghiệp.',
  },
  {
    id: 4,
    name: 'Gaming Setup Pro Console PlayStation 5',
    price: 15990000,
    image: ps5Image,
    rating: 4.6,
    sold: 450,
    category: 'Phụ kiện',
    description: 'Trọn bộ PlayStation 5 cùng phụ kiện gaming cho trải nghiệm giải trí đỉnh cao.',
  },
  {
    id: 5,
    name: 'iPad Pro M2 11 inch WiFi 128GB 2024',
    price: 32990000,
    oldPrice: 35990000,
    image: ipadImage,
    rating: 4.8,
    sold: 670,
    category: 'Tablet',
    description: 'iPad Pro M2 với hiệu năng vượt trội, màn hình Liquid Retina và hệ sinh thái iPadOS.',
  },
  {
    id: 6,
    name: 'Apple Watch Series 9 GPS 41mm Aluminum',
    price: 12990000,
    image: watchImage,
    rating: 4.7,
    sold: 980,
    category: 'Đồng hồ',
    description: 'Đồng hồ thông minh Apple Watch Series 9 với nhiều tính năng sức khỏe và kết nối mạnh mẽ.',
  },
  {
    id: 7,
    name: 'AirPods Max Over-Ear Headphones',
    price: 13490000,
    oldPrice: 14990000,
    image: airpodsMaxImage,
    rating: 4.9,
    sold: 1500,
    category: 'Tai nghe',
    description: 'Tai nghe AirPods Max với âm thanh chất lượng cao và chống ồn chủ động.',
  },
  {
    id: 8,
    name: 'iPhone 14 Pro 128GB Chính Hãng VN/A',
    price: 19990000,
    oldPrice: 24990000,
    image: iphone14Image,
    rating: 4.6,
    sold: 3400,
    category: 'Điện thoại',
    description: 'iPhone 14 Pro với thiết kế sang trọng và camera Pro mạnh mẽ.',
  },
  {
    id: 9,
    name: 'MacBook Air M3 13 inch 256GB 2024',
    price: 28990000,
    oldPrice: 31990000,
    image: macbookAirImage,
    rating: 4.8,
    sold: 1100,
    category: 'Laptop',
    description: 'MacBook Air M3 siêu nhẹ, pin lâu và hiệu suất đủ cho công việc hàng ngày.',
  },
  {
    id: 10,
    name: 'iPad Air M2 11 inch WiFi 256GB Chính Hãng',
    price: 18990000,
    image: ipadAirImage,
    rating: 4.7,
    sold: 820,
    category: 'Tablet',
    description: 'iPad Air M2 mỏng nhẹ, hiệu năng cân bằng và hỗ trợ Apple Pencil.',
  },
  {
    id: 11,
    name: 'AirPods Pro Gen 2 USB-C Chính Hãng Apple',
    price: 6490000,
    oldPrice: 6990000,
    image: airpodsProImage,
    rating: 4.9,
    sold: 2200,
    category: 'Tai nghe',
    description: 'AirPods Pro Gen 2 với chống ồn tốt và trải nghiệm âm thanh trong trẻo.',
  },
  {
    id: 12,
    name: 'iPhone 15 Plus 128GB Chính Hãng VN/A',
    price: 22990000,
    oldPrice: 25990000,
    image: iphone15PlusImage,
    rating: 4.7,
    sold: 1600,
    category: 'Điện thoại',
    description: 'iPhone 15 Plus với pin lớn và màn hình rộng cho giải trí tối ưu.',
  },
];
