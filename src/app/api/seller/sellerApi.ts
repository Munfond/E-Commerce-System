import { api } from '../client';
import { endpoints } from '../endpoints';
import type { PageDto } from '../../types/dto/common';
import type {
  ListSellerInventoryQueryDto,
  ListSellerOrdersQueryDto,
  ListSellerProductsQueryDto,
  ListSellerShopProductsQueryDto,
  SellerInventoryDto,
  SellerOrderDto,
  SellerOrderSimpleDto,
  SellerOrderStatusDto,
  SellerProductDto,
  SellerProfileUpsertDto,
  SellerShopAddressUpdateDto,
  SellerShopAddressResponseDto,
  SellerShopInfoDto,
  SellerShopProductDto,
  SellerShopProductsResponseDto,
  SellerShopRegistrationDto,
  SellerShopRegistrationResponseDto,
} from '../../types/dto/seller';

export async function listSellerProducts(params?: ListSellerProductsQueryDto) {
  return api.get<PageDto<SellerProductDto>>(endpoints.seller.products, {
    query: params as Record<string, unknown> as Record<string, string | number | boolean | null | undefined>,
  });
}

export async function listSellerShopProducts(params?: ListSellerShopProductsQueryDto) {
  const query: Record<string, string | number | boolean | null | undefined> = {};

  if (params?.q) query.q = params.q;
  if (params?.status && params.status !== 'all') query.status = params.status;
  if (params?.brand) query.brand = params.brand;
  if (params?.categoryId) query.category_id = params.categoryId;
  if (params?.page != null) query.page = params.page;
  if (params?.pageSize != null) query.limit = params.pageSize;

  return api.get<SellerShopProductsResponseDto>(endpoints.seller.shopProductsMe, {
    auth: true,
    query,
  });
}

type RawSellerOrderDto = {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  payment_method: string;
  shop_id: string;
};

function normalizeSellerOrderDto(dto: SellerOrderDto | RawSellerOrderDto): SellerOrderDto {
  if ('buyer' in dto) {
    return dto;
  }

  return {
    id: dto.id,
    buyer: dto.user_id,
    createdAt: dto.created_at,
    total: dto.total_amount,
    items: 'items' in dto ? (dto as any).items ?? 0 : 0,
    status: typeof dto.status === 'string' ? dto.status.toLowerCase() as SellerOrderDto['status'] : 'pending',
  };
}

export async function listSellerOrders(params?: ListSellerOrdersQueryDto) {
  const query: Record<string, string | number | boolean | null | undefined> = {};

  if (params?.q) query.q = params.q;
  if (params?.status && params.status !== 'all') query.status = params.status;
  if (params?.page != null && params.page !== 1) query.page = params.page;
  if (params?.pageSize != null && params.pageSize !== 10) query.pageSize = params.pageSize;
  if (params?.sortBy) query.sortBy = params.sortBy;
  if (params?.sortDir) query.sortDir = params.sortDir;

  const res = await api.get<PageDto<SellerOrderDto> | RawSellerOrderDto[]>(endpoints.seller.orders, { query });
  const rawData = res.data;

  if (Array.isArray(rawData)) {
    return {
      ...res,
      data: {
        items: rawData.map(normalizeSellerOrderDto),
        total: rawData.length,
      },
    };
  }

  return {
    ...res,
    data: {
      ...rawData,
      items: rawData.items.map(normalizeSellerOrderDto),
    },
  };
}

export async function listSellerOrderStatus(orderId: string) {
  const res = await api.get<{ status: string }>(endpoints.seller.orderStatus(orderId), { auth: true });
  return {
    ...res,
    data: {
      status: typeof res.data.status === 'string'
        ? res.data.status.toLowerCase() as SellerOrderStatusDto
        : 'pending',
    },
  };
}

export async function listSellerOrdersSimple() {
  return api.get<SellerOrderSimpleDto[]>(endpoints.orders.seller, { auth: true });
}

export async function listSellerInventory(params?: ListSellerInventoryQueryDto) {
  return api.get<PageDto<SellerInventoryDto>>(endpoints.seller.inventory, {
    query: params as Record<string, unknown> as Record<string, string | number | boolean | null | undefined>,
  });
}

export async function upsertSellerProfile(payload: SellerProfileUpsertDto) {
  return api.post<{ ok: true }>(endpoints.seller.profile, payload);
}

export async function registerSellerShop(payload: SellerShopRegistrationDto) {
  return api.post<SellerShopRegistrationResponseDto>(endpoints.seller.shops, payload);
}

export async function getSellerShopInfo() {
  return api.get<SellerShopInfoDto>(endpoints.seller.shopMe, { auth: true });
}

export async function updateSellerShopInfo(payload: {
  shop_name: string;
  shop_description: string;
  shop_logo?: File;
  legal_full_name: string;
}) {
  const body = new FormData();
  body.append('shop_name', payload.shop_name);
  body.append('shop_description', payload.shop_description);
  body.append('legal_full_name', payload.legal_full_name);
  if (payload.shop_logo) {
    body.append('shop_logo', payload.shop_logo);
  }
  return api.post<{ success: true }>(endpoints.seller.shopMe, body, { auth: true });
}

export async function updateSellerShopAddress(payload: SellerShopAddressUpdateDto) {
  return api.post<SellerShopAddressResponseDto>(endpoints.seller.shopAddress, payload, { auth: true });
}

export async function getSellerShopAddress() {
  return api.get<SellerShopAddressResponseDto>(endpoints.seller.shopAddress, { auth: true });
}

