import { api } from './client';
import { endpoints } from './endpoints';

export type ServerCartItemDto = {
  id?: string;
  product?: unknown;
  productId?: number | string;
  product_id?: number | string;
  product_name?: string;
  file_path?: string;
  price?: number;
  quantity: number;
  subtotal?: number;
  selectedColor?: string;
  selectedStorage?: string;
};

export type ServerCartResponse = {
  success: boolean;
  cart: {
    items: ServerCartItemDto[];
    total?: number;
    count?: number;
  };
};

export async function getCartFromServer() {
  const res = await api.get<ServerCartResponse>(endpoints.customer.cart, { auth: true });
  return res.data?.cart?.items ?? [];
}

export async function replaceCartOnServer(items: ServerCartItemDto[]) {
  return api.put(endpoints.customer.cart, { cart: { items } }, { auth: true });
}
