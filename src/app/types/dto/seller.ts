import type { SortDirectionDto } from './common';

export type SellerProductStatusDto = 'active' | 'hidden' | 'violation' | 'pending' | 'draft';
export type SellerOrderStatusDto = 'pending' | 'shipping' | 'completed' | 'cancelled';

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
  status?: SellerOrderStatusDto | 'all';
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

