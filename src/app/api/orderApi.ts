import { api } from './client';
import { endpoints } from './endpoints';

export type CustomerOrderDto = {
  id: string;
  total: number;
  status: string;
};

export type RawCustomerOrderDto = {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  payment_method: string;
  shop_id: string;
};

export type OrderHistoryEventDto = Record<string, unknown>;

export type CustomerOrderTrackingDto = {
  id: string;
  history: OrderHistoryEventDto[];
};

export type CreateCustomerOrderDto = {
  cart_items: Array<{ product_id: string | number; quantity: number }>;
  payment_method: string;
};

export type CreateCustomerOrderResponseDto = {
  id: string;
  total: number;
};

export const orderApi = {
  getCustomerOrders: () =>
    api.get<RawCustomerOrderDto[]>(endpoints.customer.orders, { auth: true }).then((res) => ({
      ...res,
      data: res.data.map((item) => ({
        id: item.id,
        total: item.total_amount,
        status: item.status.toLowerCase(),
      })),
    })),
  getCustomerOrder: (orderId: string) =>
    api.get<CustomerOrderTrackingDto>(endpoints.customer.order(orderId), { auth: true }),
  createCustomerOrder: (payload: CreateCustomerOrderDto) =>
    api.post<CreateCustomerOrderResponseDto>(endpoints.customer.orders, payload, { auth: true }),
  cancelCustomerOrder: (orderId: string) =>
    api.del<{ success: true }>(endpoints.customer.order(orderId), { auth: true }),
};
