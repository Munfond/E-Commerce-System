import { api } from './client';
import { endpoints } from './endpoints';

export type ServerCartItemDto = {
  product?: unknown;
  productId?: number | string;
  quantity: number;
  selectedColor?: string;
  selectedStorage?: string;
};

export async function getCartFromServer() {
  const res = await api.get<{ cart: { items: ServerCartItemDto[] } }>(endpoints.customer.cart, { auth: true });
  return res.data?.cart?.items ?? [];
}

export async function replaceCartOnServer(items: ServerCartItemDto[]) {
  return api.put(endpoints.customer.cart, { cart: { items } }, { auth: true });
}
