import type { SortDirectionDto } from './common';

export type SellerProductStatusDto = 'active' | 'hidden' | 'violation' | 'pending' | 'draft';
export type SellerOrderStatusDto =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED';

export type SellerOrderStatus = Lowercase<SellerOrderStatusDto>;

export type SellerProductDto = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: SellerProductStatusDto;
};

export type SellerOrderDto = {
  id: string;
  buyer: string;
  createdAt: string; // ISO date or datetime (backend-defined)
  total: number;
  items: number;
  status: SellerOrderStatusDto;
};

export type SellerOrderSimpleDto = {
  id: string;
  customer_name: string;
};

export type SellerInventoryDto = {
  id: string;
  name: string;
  sku: string;
  onHand: number;
  reserved: number;
  available: number;
};

export type SellerProfileUpsertDto = {
  shopName: string;
  pickupAddress: string;
  email: string;
  phone: string;
  shippingProvider: string;
  identityFullName: string;
  identityIdNumber: string;
  identityAddress: string;
  taxCode: string;
  taxCompanyName?: string;
};

export type SellerShopRegistrationDto = {
  shop_info: {
    shop_name: string;
    shop_description: string;
    legal_full_name: string;
    identity_number: string;
    tax_code: string;
  };
  shop_address: {
    receiver_name: string;
    receiver_phone: string;
    city: string;
    ward: string;
    details: string;
  };
};

export type SellerShopRegistrationResponseDto = {
  id: string;
  status: string;
};

export type SellerShopInfoDto = {
  id: string;
  shop_name: string;
  shop_description?: string;
  legal_full_name?: string;
  shop_logo?: string;
  email?: string;
  phone?: string;
  status?: string;
  tax_code?: string;
  identity_number?: string;
};

export type SellerShopProductImageDto = {
  file_path: string;
};

export type SellerShopProductDto = {
  id?: string;
  name: string;
  description?: string;
  brand?: string;
  sold_count?: number;
  category_id?: number | string;
  product_images?: SellerShopProductImageDto[];
};

export type SellerShopProductsResponseDto = {
  success: true;
  products: SellerShopProductDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ListSellerShopProductsQueryDto = {
  q?: string;
  status?: SellerProductStatusDto | 'all';
  brand?: string;
  categoryId?: number | string;
  page?: number;
  pageSize?: number;
};

export type SellerShopStatusDto = 'OPEN' | 'CLOSED' | 'MAINTENANCE';

export type SellerShopAddressUpdateDto = {
  status: SellerShopStatusDto;
};

export type SellerShopAddressResponseDto = {
  id: string;
  status: SellerShopStatusDto;
};

export type ListSellerProductsQueryDto = {
  q?: string;
  status?: SellerProductStatusDto | 'all';
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'price' | 'stock';
  sortDir?: SortDirectionDto;
};

export type ListSellerOrdersQueryDto = {
  q?: string;
  status?: SellerOrderStatus | 'all';
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'total';
  sortDir?: SortDirectionDto;
};

export type ListSellerInventoryQueryDto = {
  q?: string;
  onlyLow?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'available' | 'onHand';
  sortDir?: SortDirectionDto;
};

