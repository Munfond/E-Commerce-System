import { api } from '../client';
import { endpoints } from '../endpoints';
import type { PageDto } from '../../types/dto/common';
import type {
  ListSellerInventoryQueryDto,
  ListSellerOrdersQueryDto,
  ListSellerProductsQueryDto,
  SellerInventoryDto,
  SellerOrderDto,
  SellerProductDto,
  SellerProfileUpsertDto,
} from '../../types/dto/seller';

export async function listSellerProducts(params?: ListSellerProductsQueryDto) {
  return api.get<PageDto<SellerProductDto>>(endpoints.seller.products, {
    query: params as Record<string, unknown> as Record<string, string | number | boolean | null | undefined>,
  });
}

export async function listSellerOrders(params?: ListSellerOrdersQueryDto) {
  return api.get<PageDto<SellerOrderDto>>(endpoints.seller.orders, {
    query: params as Record<string, unknown> as Record<string, string | number | boolean | null | undefined>,
  });
}

export async function listSellerInventory(params?: ListSellerInventoryQueryDto) {
  return api.get<PageDto<SellerInventoryDto>>(endpoints.seller.inventory, {
    query: params as Record<string, unknown> as Record<string, string | number | boolean | null | undefined>,
  });
}

export async function upsertSellerProfile(payload: SellerProfileUpsertDto) {
  return api.post<{ ok: true }>(endpoints.seller.profile, payload);
}

