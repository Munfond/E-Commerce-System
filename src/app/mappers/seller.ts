import type {
  SellerInventoryDto,
  SellerOrderDto,
  SellerProductDto,
  SellerProfileUpsertDto,
} from '../types/dto/seller';
import type { SellerInventoryItem, SellerOrder, SellerProduct, SellerProfile } from '../types/models/seller';

export function mapSellerProductDto(dto: SellerProductDto): SellerProduct {
  return {
    id: dto.id,
    name: dto.name,
    sku: dto.sku,
    priceVnd: dto.price,
    stock: dto.stock,
    status: dto.status,
  };
}

export function mapSellerOrderDto(dto: SellerOrderDto): SellerOrder {
  const parsed = new Date(dto.createdAt);
  return {
    id: dto.id,
    buyerName: dto.buyer,
    createdAt: Number.isNaN(parsed.getTime()) ? new Date() : parsed,
    totalVnd: dto.total,
    itemCount: dto.items,
    status: dto.status,
  };
}

export function mapSellerInventoryDto(dto: SellerInventoryDto): SellerInventoryItem {
  const isLow = dto.available <= 10;
  return {
    id: dto.id,
    name: dto.name,
    sku: dto.sku,
    onHand: dto.onHand,
    reserved: dto.reserved,
    available: dto.available,
    isLow,
  };
}

export function mapSellerProfileUpsertDtoToModel(dto: SellerProfileUpsertDto): SellerProfile {
  return {
    shopName: dto.shopName,
    pickupAddress: dto.pickupAddress,
    email: dto.email,
    phone: dto.phone,
    shippingProvider: dto.shippingProvider,
    identityFullName: dto.identityFullName,
    identityIdNumber: dto.identityIdNumber,
    identityAddress: dto.identityAddress,
    taxCode: dto.taxCode,
    taxCompanyName: dto.taxCompanyName,
  };
}

export function mapSellerProfileModelToUpsertDto(model: SellerProfile): SellerProfileUpsertDto {
  return {
    shopName: model.shopName,
    pickupAddress: model.pickupAddress,
    email: model.email,
    phone: model.phone,
    shippingProvider: model.shippingProvider,
    identityFullName: model.identityFullName,
    identityIdNumber: model.identityIdNumber,
    identityAddress: model.identityAddress,
    taxCode: model.taxCode,
    taxCompanyName: model.taxCompanyName,
  };
}

