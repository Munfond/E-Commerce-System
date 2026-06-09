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

export type AdminOrderDto = {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  payment_method: string;
  shop_id: string;
};

type AdminOrdersResponse =
  | AdminOrderDto[]
  | { data?: AdminOrderDto[] | { items?: AdminOrderDto[] } }
  | { items?: AdminOrderDto[] };

function normalizeAdminOrderDto(order: AdminOrderDto | Record<string, unknown>): AdminOrderDto {
  return {
    id: String(order.id ?? ''),
    user_id: String(order.user_id ?? ''),
    total_amount: Number(order.total_amount ?? 0),
    status: String(order.status ?? 'PENDING'),
    created_at: String(order.created_at ?? ''),
    payment_method: String(order.payment_method ?? ''),
    shop_id: String(order.shop_id ?? ''),
  };
}

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
  getAdminOrders: async () => {
    const res = await api.get<AdminOrdersResponse>(endpoints.orders.admin, { auth: true });
    const raw = res.data;
    const items = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as { data?: AdminOrderDto[] }).data)
        ? (raw as { data: AdminOrderDto[] }).data
        : Array.isArray((raw as { items?: AdminOrderDto[] }).items)
          ? (raw as { items: AdminOrderDto[] }).items
          : Array.isArray((raw as { data?: { items?: AdminOrderDto[] } }).data?.items)
            ? (raw as { data: { items: AdminOrderDto[] } }).data.items
            : [];

    return {
      ...res,
      data: items.map((item) => normalizeAdminOrderDto(item)),
    };
  },
};
