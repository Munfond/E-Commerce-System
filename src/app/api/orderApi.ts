import { api } from './client';
import { endpoints } from './endpoints';

export type CustomerOrderDto = {
  id: string;
  total: number;
  status: string;
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
  getCustomerOrders: () => api.get<CustomerOrderDto[]>(endpoints.customer.orders, { auth: true }),
  getCustomerOrder: (orderId: string) =>
    api.get<CustomerOrderTrackingDto>(endpoints.customer.order(orderId), { auth: true }),
  createCustomerOrder: (payload: CreateCustomerOrderDto) =>
    api.post<CreateCustomerOrderResponseDto>(endpoints.customer.orders, payload, { auth: true }),
  cancelCustomerOrder: (orderId: string) =>
    api.del<{ success: true }>(endpoints.customer.order(orderId), { auth: true }),
};
