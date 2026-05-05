import type { HttpMethod, RequestOptions } from '../http';
import { endpoints } from '../endpoints';
import type { PageDto } from '../../types/dto/common';
import type {
  SellerInventoryDto,
  SellerOrderDto,
  SellerProductDto,
  SellerProfileUpsertDto,
  SellerProductStatusDto,
  SellerOrderStatusDto,
} from '../../types/dto/seller';

type MockResult = { status: number; body?: unknown; headers?: Record<string, string> };

const productsSeed: SellerProductDto[] = [
  { id: '3802891996', name: 'weew_update', sku: 'SKU-01996', price: 12, stock: 10000, status: 'hidden' },
  { id: '3602897167', name: 'SPĐGT-39566 Deal 1', sku: 'SKU-97167', price: 900, stock: 10000, status: 'hidden' },
  { id: '3602897001', name: 'Áo thun basic unisex', sku: 'SKU-97001', price: 129000, stock: 250, status: 'active' },
  { id: '3602897002', name: 'Tai nghe Bluetooth 5.3', sku: 'SKU-97002', price: 299000, stock: 80, status: 'pending' },
  { id: '3602897003', name: 'Sạc nhanh 20W Type-C', sku: 'SKU-97003', price: 149000, stock: 0, status: 'draft' },
];

const ordersSeed: SellerOrderDto[] = [
  { id: 'SV-1024', buyer: 'Nguyễn An', createdAt: '2026-04-28', total: 1250000, items: 3, status: 'pending' },
  { id: 'SV-1023', buyer: 'Trần Minh', createdAt: '2026-04-28', total: 320000, items: 1, status: 'shipping' },
  { id: 'SV-1022', buyer: 'Lê Hồng', createdAt: '2026-04-27', total: 780000, items: 2, status: 'completed' },
  { id: 'SV-1021', buyer: 'Phạm Vy', createdAt: '2026-04-26', total: 210000, items: 1, status: 'cancelled' },
];

const inventorySeed: SellerInventoryDto[] = [
  { id: '3602897001', name: 'Áo thun basic unisex', sku: 'SKU-97001', onHand: 250, reserved: 12, available: 238 },
  { id: '3602897002', name: 'Tai nghe Bluetooth 5.3', sku: 'SKU-97002', onHand: 80, reserved: 5, available: 75 },
  { id: '3602897003', name: 'Sạc nhanh 20W Type-C', sku: 'SKU-97003', onHand: 0, reserved: 0, available: 0 },
  { id: '3802891996', name: 'weew_update', sku: 'SKU-01996', onHand: 10000, reserved: 0, available: 10000 },
];

let sellerProfile: SellerProfileUpsertDto | null = null;

function paginate<T>(items: T[], page = 1, pageSize = 20): PageDto<T> {
  const p = Math.max(1, page);
  const ps = Math.max(1, Math.min(200, pageSize));
  const start = (p - 1) * ps;
  return { items: items.slice(start, start + ps), total: items.length, page: p, pageSize: ps };
}

function like(hay: string, q?: string) {
  if (!q) return true;
  return hay.toLowerCase().includes(q.trim().toLowerCase());
}

function isProductStatus(v: unknown): v is SellerProductStatusDto {
  return v === 'active' || v === 'hidden' || v === 'violation' || v === 'pending' || v === 'draft';
}

function isOrderStatus(v: unknown): v is SellerOrderStatusDto {
  return v === 'pending' || v === 'shipping' || v === 'completed' || v === 'cancelled';
}

export async function mockHandle(method: HttpMethod, path: string, options?: RequestOptions): Promise<MockResult | null> {
  // normalize path without base url
  const url = new URL(path, window.location.origin);
  const pathname = url.pathname;

  // auth endpoints (mock)
  if (pathname === endpoints.auth.login && method === 'POST') {
    return { status: 200, body: { accessToken: 'demo-token', role: 'seller' } };
  }
  if (pathname === endpoints.auth.me && method === 'GET') {
    return { status: 200, body: { id: 'demo-user', email: 'demo@shopviet.local', role: 'seller' } };
  }

  // seller lists
  if (pathname === endpoints.seller.products && method === 'GET') {
    const q = (options?.query?.q as string | undefined) ?? url.searchParams.get('q') ?? undefined;
    const rawStatus = (options?.query?.status as string | undefined) ?? url.searchParams.get('status') ?? undefined;
    const page = Number((options?.query?.page as number | undefined) ?? url.searchParams.get('page') ?? 1);
    const pageSize = Number((options?.query?.pageSize as number | undefined) ?? url.searchParams.get('pageSize') ?? 20);

    let items = productsSeed.filter((p) => like(`${p.id} ${p.name} ${p.sku}`, q));
    if (rawStatus && rawStatus !== 'all' && isProductStatus(rawStatus)) {
      items = items.filter((p) => p.status === rawStatus);
    }
    return { status: 200, body: paginate(items, page, pageSize) };
  }

  if (pathname === endpoints.seller.orders && method === 'GET') {
    const q = (options?.query?.q as string | undefined) ?? url.searchParams.get('q') ?? undefined;
    const rawStatus = (options?.query?.status as string | undefined) ?? url.searchParams.get('status') ?? undefined;
    const page = Number((options?.query?.page as number | undefined) ?? url.searchParams.get('page') ?? 1);
    const pageSize = Number((options?.query?.pageSize as number | undefined) ?? url.searchParams.get('pageSize') ?? 20);

    let items = ordersSeed.filter((o) => like(`${o.id} ${o.buyer}`, q));
    if (rawStatus && rawStatus !== 'all' && isOrderStatus(rawStatus)) {
      items = items.filter((o) => o.status === rawStatus);
    }
    return { status: 200, body: paginate(items, page, pageSize) };
  }

  if (pathname === endpoints.seller.inventory && method === 'GET') {
    const q = (options?.query?.q as string | undefined) ?? url.searchParams.get('q') ?? undefined;
    const onlyLowRaw =
      (options?.query?.onlyLow as boolean | undefined) ??
      (url.searchParams.get('onlyLow') === 'true' ? true : url.searchParams.get('onlyLow') === 'false' ? false : undefined);
    const page = Number((options?.query?.page as number | undefined) ?? url.searchParams.get('page') ?? 1);
    const pageSize = Number((options?.query?.pageSize as number | undefined) ?? url.searchParams.get('pageSize') ?? 20);

    let items = inventorySeed.filter((r) => like(`${r.id} ${r.name} ${r.sku}`, q));
    if (onlyLowRaw) items = items.filter((r) => r.available <= 10);
    return { status: 200, body: paginate(items, page, pageSize) };
  }

  if (pathname === endpoints.seller.profile && method === 'POST') {
    const payload = options?.body as SellerProfileUpsertDto | undefined;
    if (!payload?.shopName || !payload?.email) {
      return {
        status: 400,
        body: {
          code: 'VALIDATION_ERROR',
          message: 'Thiếu thông tin bắt buộc',
          details: { fields: { shopName: !payload?.shopName ? 'required' : undefined, email: !payload?.email ? 'required' : undefined } },
        },
      };
    }
    sellerProfile = payload;
    return { status: 200, body: { ok: true } };
  }

  return null;
}

