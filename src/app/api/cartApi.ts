import { api } from './client';
import { endpoints } from './endpoints';

// 1. Định nghĩa Type cho từng sản phẩm trong giỏ (nằm trong Shop)
export type ServerCartItemDto = {
  id: string;          
  product_id: string; 
  product_name: string;
  variant_id: string;
  variant_name: string; // 💡 Đã có variant_name (Ví dụ: "Dark Blue", "Đen - Size L")
  file_path: string;
  price: number;
  quantity: number;
  subtotal: number;
  stock: number;        // 💡 Số lượng tồn kho để Frontend giới hạn nút tăng số lượng
};

// 2. Định nghĩa Type cho từng Cửa hàng (Shop)
export type ServerCartShopDto = {
  shop_id: string;
  shop_name: string;
  shop_logo: string | null;
  shop_subtotal: number;
  items: ServerCartItemDto[]; // Mảng các sản phẩm thuộc shop này
};

// 3. Định nghĩa Type cho toàn bộ dữ liệu Giỏ hàng trả về từ Server
export type ServerCartResponseDto = {
  shops: ServerCartShopDto[];
  cart_total_price: number;
  cart_total_items_count: number;
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * 1. Lấy danh sách giỏ hàng phân cấp theo Shop (GET /customer/cart)
 * @returns Trả về Object giỏ hàng hoàn chỉnh bao gồm danh sách shop và tổng tiền
 */
export async function getCartFromServer(): Promise<ServerCartResponseDto> {
  const res = await api.get<{ success: boolean; cart: ServerCartResponseDto }>(
    endpoints.customer.cart, 
    { auth: true }
  );
  
  // Trả về đúng cấu trúc giỏ hàng mới, nếu lỗi hoặc trống thì fallback về object mặc định
  return res.data?.cart ?? { shops: [], cart_total_price: 0, cart_total_items_count: 0 };
}

/**
 * 2. Thêm sản phẩm vào giỏ (POST /customer/cart/:variant_id)
 * @param variantId ID của biến thể sản phẩm cụ thể
 * @param quantity Số lượng muốn thêm (mặc định là 1)
 */
export async function addToCartServer(variantId: string, quantity: number = 1) {
  return api.post(`${endpoints.customer.cart}/${variantId}`, { quantity }, { auth: true });
}

/**
 * 3. Cập nhật số lượng sản phẩm dựa trên item_id (PUT /customer/cart/items/:item_id)
 * @param itemId ID của bản ghi item trong giỏ hàng (chứ không phải variant_id)
 * @param quantity Số lượng mới muốn cập nhật
 */
export async function updateCartItemQuantityServer(itemId: string, quantity: number) {
  return api.put(`${endpoints.customer.cart}/items/${itemId}`, { quantity }, { auth: true });
}

/**
 * 4. Xóa một sản phẩm ra khỏi giỏ hàng (DELETE /customer/cart/items/:item_id)
 * @param itemId ID của bản ghi item trong giỏ hàng
 */
export async function removeFromCartServer(itemId: string) {
  return api.del(`${endpoints.customer.cart}/items/${itemId}`, { auth: true });
}

/**
 * 5. Xóa sạch sành sanh toàn bộ giỏ hàng (DELETE /customer/cart)
 * Thêm hàm này vì route Backend của bạn đã có sẵn router.delete('/')
 */
export async function clearCartServer() {
  return api.del(endpoints.customer.cart, { auth: true });
}