export type SellerProductStatus = 'active' | 'hidden' | 'violation' | 'pending' | 'draft';
export type SellerOrderStatus = 'pending' | 'shipping' | 'completed' | 'cancelled';

export type SellerProduct = {
  id: string;
  name: string;
  sku: string;
  priceVnd: number;
  stock: number;
  status: SellerProductStatus;
};

export type SellerOrder = {
  id: string;
  buyerName: string;
  createdAt: Date;
  totalVnd: number;
  itemCount: number;
  status: SellerOrderStatus;
};

export type SellerInventoryItem = {
  id: string;
  name: string;
  sku: string;
  onHand: number;
  reserved: number;
  available: number;
  isLow: boolean;
};

export type SellerProfile = {
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

