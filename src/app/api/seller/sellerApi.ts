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
  SellerOrderStatus,
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

export type UpdateSellerShopProductDto = {
  name?: string;
  description?: string;
};

export type CreateSellerShopProductDto = {
  productData: {
    name: string;
    description: string;
    category_id: number | string;
    brand: string;
  };
  variants: Array<{
    name: string;
    input_price: number;
    sale_price: number;
    stock: number;
  }>;
  variant_files?: Record<string, File | File[]> | {};
  product_images?: File[];
};

function buildCreateSellerShopProductBody(payload: CreateSellerShopProductDto) {
  const hasFiles = Array.isArray(payload.product_images) && payload.product_images.length > 0;

  if (!hasFiles) {
    const result: Record<string, unknown> = {
      productData: payload.productData,
      variants: payload.variants,
    };

    if (payload.variant_files) {
      result.variant_files = payload.variant_files;
    }

    return result;
  }

  const body = new FormData();
  body.append('productData', JSON.stringify(payload.productData));
  body.append('variants', JSON.stringify(payload.variants));
  body.append('variant_files', JSON.stringify(payload.variant_files ?? {}));

  for (const file of payload.product_images ?? []) {
    body.append('product_images', file);
  }

  return body;
}

export async function createSellerShopProduct(payload: CreateSellerShopProductDto) {
  return api.post<{ success: true; data: SellerShopProductDto | Record<string, unknown> }>(
    endpoints.seller.shopProductsMe,
    buildCreateSellerShopProductBody(payload),
    { auth: true }
  );
}

type CreateSellerShopProductVariantDto = {
  name: string;
  input_price: number;
  sale_price: number;
  stock: number;
};

export type CreateSellerShopProductVariantsDto = {
  variants: CreateSellerShopProductVariantDto[];
  variant_files?: File[];
};

function buildCreateSellerShopProductVariantsBody(payload: CreateSellerShopProductVariantsDto) {
  const hasFiles = Array.isArray(payload.variant_files) && payload.variant_files.length > 0;

  if (!hasFiles) {
    return {
      variants: payload.variants,
    };
  }

  const body = new FormData();
  body.append('variants', JSON.stringify(payload.variants));
  for (const file of payload.variant_files ?? []) {
    body.append('variant_files', file);
  }

  return body;
}

export async function createSellerShopProductVariants(
  id: string,
  payload: CreateSellerShopProductVariantsDto,
) {
  return api.post<{ success: true; data: Record<string, unknown> }>(
    endpoints.seller.shopProductVariants(id),
    buildCreateSellerShopProductVariantsBody(payload),
    { auth: true }
  );
}

export async function deleteSellerShopProductVariant(variantId: string) {
  return api.del<{ success: true; message: string }>(
    endpoints.seller.shopProductVariant(variantId),
    { auth: true }
  );
}

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

function normalizeOrderStatus(status: string): SellerOrderStatusDto {
  const normalized = status.toUpperCase();
  const allowedStatuses: SellerOrderStatusDto[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED'];
  return allowedStatuses.includes(normalized as SellerOrderStatusDto) ? (normalized as SellerOrderStatusDto) : 'PENDING';
}

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
    status: typeof dto.status === 'string' ? normalizeOrderStatus(dto.status) : 'PENDING',
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

export async function listSellerOrderStatus(id: string) {
  const res = await api.get<{ status: string }>(endpoints.seller.orderStatus(id), { auth: true });
  return {
    ...res,
    data: {
      status: typeof res.data.status === 'string'
        ? res.data.status.toLowerCase() as SellerOrderStatus
        : ('pending' as SellerOrderStatus),
    },
  };
}

export async function updateSellerOrderStatus(id: string, status: SellerOrderStatusDto) {
  return api.patch<{ success: true }>(endpoints.seller.orderStatus(id), { status }, { auth: true });
}

export async function listSellerOrdersSimple() {
  return api.get<SellerOrderSimpleDto[]>(endpoints.orders.seller, { auth: true });
}

export async function updateSellerShopProduct(id: string, payload: UpdateSellerShopProductDto) {
  return api.patch<SellerShopProductDto>(endpoints.seller.shopProduct(id), payload, { auth: true });
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

type SellerShopInfoRawDto =
  | SellerShopInfoDto
  | { success: boolean; data?: SellerShopInfoDto | { shop: SellerShopInfoDto; shop_info?: SellerShopInfoDto } }
  | { data?: SellerShopInfoDto | { shop: SellerShopInfoDto; shop_info?: SellerShopInfoDto } }
  | { shop?: SellerShopInfoDto; shop_info?: SellerShopInfoDto };

function normalizeSellerShopInfoDto(raw: unknown): SellerShopInfoDto {
  const asObj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};

  let payload = asObj as Record<string, unknown>;
  if (typeof payload.success === 'boolean' && payload.data) {
    payload = payload.data as Record<string, unknown>;
  } else if (payload.data) {
    payload = payload.data as Record<string, unknown>;
  }

  const shop = (payload.shop ?? payload.shop_info ?? payload) as Record<string, unknown>;

  return {
    id: String(shop.id ?? ''),
    shop_name: String(shop.shop_name ?? shop.name ?? ''),
    shop_description: shop.shop_description ? String(shop.shop_description) : undefined,
    legal_full_name: shop.legal_full_name ? String(shop.legal_full_name) : undefined,
    shop_logo: shop.shop_logo ? String(shop.shop_logo) : undefined,
    email: shop.email ? String(shop.email) : undefined,
    phone: shop.phone ? String(shop.phone) : undefined,
    status: shop.status ? String(shop.status) : undefined,
    tax_code: shop.tax_code ? String(shop.tax_code) : undefined,
    identity_number: shop.identity_number ? String(shop.identity_number) : undefined,
  };
}

export async function getSellerShopInfo() {
  const res = await api.get<SellerShopInfoRawDto>(endpoints.seller.shopMe, { auth: true });
  return {
    ...res,
    data: normalizeSellerShopInfoDto(res.data),
  };
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

