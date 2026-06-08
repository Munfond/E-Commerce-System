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
