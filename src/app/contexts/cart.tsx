import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  getCartFromServer, 
  addToCartServer, 
  updateCartItemQuantityServer, 
  removeFromCartServer, 
  clearCartServer,
  ServerCartResponseDto,
  ServerCartShopDto,
  ServerCartItemDto
} from '../api/cartApi';
import { getAccessToken } from '../api/authStorage';

// Định nghĩa lại giá trị mà Context này sẽ cung cấp cho toàn App
type CartContextValue = {
  cartData: ServerCartResponseDto; // Chứa toàn bộ { shops, cart_total_price, cart_total_items_count }
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (variantId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (itemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
};

const CartContext = createContext<CartContextValue | null>(null);

const DEFAULT_CART_STATE: ServerCartResponseDto = {
  shops: [],
  cart_total_price: 0,
  cart_total_items_count: 0
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartData, setCartData] = useState<ServerCartResponseDto>(DEFAULT_CART_STATE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isAuthenticated = Boolean(getAccessToken());

  // Hàm chủ động kéo dữ liệu mới nhất từ Server về cập nhật State
  const refreshCart = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const serverCart = await getCartFromServer();
      setCartData(serverCart);
    } catch (error) {
      console.error("Failed to fetch cart from server:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tự động load giỏ hàng khi user đăng nhập thành công vào ứng dụng
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCartData(DEFAULT_CART_STATE);
    }
  }, [isAuthenticated]);

  /**
   * 1. Thêm sản phẩm vào giỏ hàng bằng variantId
   */
  const addToCart = async (variantId: string, quantity = 1): Promise<boolean> => {
    if (!isAuthenticated) {
      // Nếu là Guest (Chưa đăng nhập), bạn có thể hiển thị thông báo bắt buộc login
      alert("Vui lòng đăng nhập để thực hiện tính năng này");
      return false;
    }
    try {
      await addToCartServer(variantId, quantity);
      await refreshCart(); // Kéo lại data mới để đồng bộ UI
      return true;
    } catch (error) {
      console.error("Error adding item to cart:", error);
      return false;
    }
  };

  /**
   * 2. Cập nhật số lượng dựa trên ITEM_ID (id của hàng trong giỏ)
   */
  const updateQuantity = async (itemId: string, quantity: number): Promise<boolean> => {
    if (quantity < 1) return false;
    try {
      // Tối ưu UI (Optimistic Update) bằng cách đổi trực tiếp số lượng ở local trước cho mượt
      setCartData((prev) => {
        const updatedShops = prev.shops.map((shop) => {
          const updatedItems = shop.items.map((item) => {
            if (item.id === itemId) {
              return { ...item, quantity, subtotal: item.price * quantity };
            }
            return item;
          });
          
          return {
            ...shop,
            items: updatedItems,
            shop_subtotal: updatedItems.reduce((sum, item) => sum + item.subtotal, 0)
          };
        });

        return {
          shops: updatedShops,
          cart_total_price: updatedShops.reduce((sum, shop) => sum + shop.shop_subtotal, 0),
          cart_total_items_count: updatedShops.reduce((sum, shop) => sum + shop.items.reduce((s, i) => s + i.quantity, 0), 0)
        };
      });

      // Gửi lệnh lên server đồng bộ ngầm
      await updateCartItemQuantityServer(itemId, quantity);
      return true;
    } catch (error) {
      console.error("Error updating item quantity:", error);
      refreshCart(); // Nếu server lỗi thì kéo lại dữ liệu chuẩn để sửa sai UI
      return false;
    }
  };

  /**
   * 3. Xóa sản phẩm dựa trên ITEM_ID
   */
  const removeFromCart = async (itemId: string): Promise<boolean> => {
    try {
      await removeFromCartServer(itemId);
      await refreshCart();
      return true;
    } catch (error) {
      console.error("Error removing item from cart:", error);
      return false;
    }
  };

  /**
   * 4. Xóa sạch giỏ hàng
   */
  const clearCart = async (): Promise<boolean> => {
    try {
      await clearCartServer();
      setCartData(DEFAULT_CART_STATE);
      return true;
    } catch (error) {
      console.error("Error clearing cart:", error);
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{ 
        cartData, 
        isLoading, 
        refreshCart, 
        addToCart, 
        updateQuantity, 
        removeFromCart, 
        clearCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}