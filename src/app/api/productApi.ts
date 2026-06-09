import { api } from './client';
import { endpoints } from './endpoints';

export type CustomerProductVariantDto = {
  id: string;
  sku: string;
  name: string;
  stock: number;
  file_path: string;
  product_id: string;
  sale_price: number;
  input_price: number;
};

export type CustomerProductImageDto = {
  file_path: string;
};

export type CustomerProductDto = {
  id: string;
  name: string;
  category_id: number;
  product_variants: CustomerProductVariantDto[];
  product_images: CustomerProductImageDto[];
};

export type CustomerProductSearchResponseDto = {
  success: true;
  data: CustomerProductDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type AdminProductDto = {
  id: string;
  shop_id: string;
};

type AdminProductsResponse =
  | AdminProductDto[]
  | AdminProductDto
  | { data?: AdminProductDto[] | AdminProductDto }
  | { items?: AdminProductDto[] | AdminProductDto };

function normalizeAdminProductDto(product: AdminProductDto | Record<string, unknown>): AdminProductDto {
  return {
    id: String(product.id ?? ''),
    shop_id: String(product.shop_id ?? ''),
  };
}

export async function searchCustomerProducts(
  keyword: string,
  page = 1,
  limit = 10
) {
  return api.get<CustomerProductSearchResponseDto>(endpoints.products.customerSearch, {
    auth: false,
    query: {
      q: keyword,
      page,
      limit,
    },
  });
}

export async function searchProductsByKeyword(
  keyword: string,
  page = 1,
  limit = 10
) {
  return api.get<CustomerProductSearchResponseDto>(endpoints.products.keywordSearch, {
    auth: false,
    query: {
      q: keyword,
      page,
      limit,
    },
  });
}

export async function getAdminProducts(productId?: string) {
  const endpoint = productId ? endpoints.products.adminProduct(productId) : endpoints.products.adminProducts;
  const res = await api.get<AdminProductsResponse>(endpoint, { auth: true });
  const raw = res.data;

  const items = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { data?: AdminProductDto[] }).data)
      ? (raw as { data: AdminProductDto[] }).data
      : Array.isArray((raw as { items?: AdminProductDto[] }).items)
        ? (raw as { items: AdminProductDto[] }).items
        : raw && typeof raw === 'object' && 'id' in raw
          ? [raw as AdminProductDto]
          : [];

  return {
    ...res,
    data: items.map((item) => normalizeAdminProductDto(item)),
  };
}
