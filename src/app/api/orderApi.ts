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

export type CustomerOrderItemDto = {
  id: string;
  quantity: number;
  price_at_purchase: number;
  variant: {
    id: string;
    sku: string;
    name: string;
    product: {
      id: string;
      name: string;
      slug: string;
    };
    sale_price: number;
  };
};

export type CustomerOrderDetailDto = {
  id: string;
  user_id: string;
  address_id: string;
  shop_id: string;
  total_amount: number;
  shipping_fee: number | null;
  voucher_code: string | null;
  payment_method: string;
  status: string;
  created_at: string;
  items: CustomerOrderItemDto[];
  history?: OrderHistoryEventDto[];
};

type RawCustomerOrderDetailDto = CustomerOrderDetailDto | { data?: CustomerOrderDetailDto };

export type CreateCustomerOrderDto = {
  payment_method: string;
  shipping_address: string;
};

export type CreateCustomerOrderResponseDto = {
  id: string;
  total_amount: number;
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

function normalizeCustomerOrderDetailDto(order: CustomerOrderDetailDto | Record<string, unknown>): CustomerOrderDetailDto {
  const items = Array.isArray((order as { items?: unknown[] }).items)
    ? ((order as { items?: unknown[] }).items as Array<Record<string, unknown>>).map((item) => ({
        id: String(item.id ?? ''),
        quantity: Number(item.quantity ?? 0),
        price_at_purchase: Number(item.price_at_purchase ?? 0),
        variant: {
          id: String((item.variant as Record<string, unknown> | undefined)?.id ?? ''),
          sku: String((item.variant as Record<string, unknown> | undefined)?.sku ?? ''),
          name: String((item.variant as Record<string, unknown> | undefined)?.name ?? ''),
          product: {
            id: String(((item.variant as Record<string, unknown> | undefined)?.product as Record<string, unknown> | undefined)?.id ?? ''),
            name: String(((item.variant as Record<string, unknown> | undefined)?.product as Record<string, unknown> | undefined)?.name ?? ''),
            slug: String(((item.variant as Record<string, unknown> | undefined)?.product as Record<string, unknown> | undefined)?.slug ?? ''),
          },
          sale_price: Number((item.variant as Record<string, unknown> | undefined)?.sale_price ?? 0),
        },
      }))
    : [];

  return {
    id: String(order.id ?? ''),
    user_id: String(order.user_id ?? ''),
    address_id: String(order.address_id ?? ''),
    shop_id: String(order.shop_id ?? ''),
    total_amount: Number(order.total_amount ?? 0),
    shipping_fee: order.shipping_fee == null ? null : Number(order.shipping_fee),
    voucher_code: order.voucher_code == null ? null : String(order.voucher_code),
    payment_method: String(order.payment_method ?? ''),
    status: String(order.status ?? 'PENDING'),
    created_at: String(order.created_at ?? ''),
    items,
    history: Array.isArray((order as { history?: unknown[] }).history)
      ? ((order as { history?: unknown[] }).history as OrderHistoryEventDto[])
      : undefined,
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
    api.get<RawCustomerOrderDetailDto | CustomerOrderTrackingDto>(endpoints.customer.order(orderId), { auth: true }).then((res) => {
      const raw = res.data as Record<string, unknown>;

      if ('items' in raw || 'payment_method' in raw || 'total_amount' in raw) {
        return {
          ...res,
          data: normalizeCustomerOrderDetailDto(raw),
        };
      }

      return res as typeof res & { data: CustomerOrderTrackingDto };
    }),
  createCustomerOrder: (payload: CreateCustomerOrderDto) =>
    api.post<CreateCustomerOrderResponseDto>(endpoints.customer.orders, payload, { auth: true }),
  cancelCustomerOrder: (orderId: string, reason: string) =>
    api.patch<{ success: true }>(endpoints.customer.order(orderId), { reason: reason }, { auth: true }),
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
