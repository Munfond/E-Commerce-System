import type { HttpMethod, RequestOptions } from '../http';
import { endpoints } from '../endpoints';
import type { PageDto } from '../../types/dto/common';
import type {
  SellerInventoryDto,
  SellerOrderDto,
  SellerProductDto,
  SellerProfileUpsertDto,
  SellerShopRegistrationDto,
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
    const payload = options?.body as Record<string, unknown> | undefined;
    if (!payload?.email || !payload?.password) {
      return {
        status: 400,
        body: {
          code: 'VALIDATION_ERROR',
          message: 'Email và mật khẩu là bắt buộc',
        },
      };
    }

    return {
      status: 200,
      body: {
        message: 'Đăng nhập thành công',
        data: {
          accessToken: 'demo-token',
          refreshToken: 'demo-refresh-token',
          user: {
            id: 'demo-user',
            username: 'Demo User',
            email: payload.email,
            roles: ['customer'],
          },
        },
      },
    };
  }
  
  if (pathname === endpoints.auth.refresh && method === 'POST') {
    const payload = options?.body as Record<string, unknown> | undefined;
    if (!payload?.refreshToken || typeof payload.refreshToken !== 'string') {
      return {
        status: 400,
        body: {
          code: 'VALIDATION_ERROR',
          message: 'Refresh token là bắt buộc',
        },
      };
    }

    return {
      status: 200,
      body: {
        accessToken: 'demo-token-refreshed',
        expiresIn: 3600,
      },
    };
  }
  
  if (pathname === endpoints.auth.register && method === 'POST') {
    const payload = options?.body as Record<string, unknown> | undefined;
    
    // Validate required fields
    if (!payload?.email || !payload?.username || !payload?.password) {
      return {
        status: 400,
        body: {
          code: 'VALIDATION_ERROR',
          message: 'Thiếu thông tin bắt buộc',
          details: {
            fields: {
              email: !payload?.email ? 'required' : undefined,
              username: !payload?.username ? 'required' : undefined,
              password: !payload?.password ? 'required' : undefined,
            },
          },
        },
      };
    }
    
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof payload.email !== 'string' || !emailRegex.test(payload.email)) {
      return {
        status: 400,
        body: {
          code: 'INVALID_EMAIL',
          message: 'Email không hợp lệ',
        },
      };
    }
    
    // Simulate OTP sent
    return {
      status: 200,
      body: {
        message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực.',
        otpSent: true,
      },
    };
  }
  
  if (pathname === endpoints.auth.verify && method === 'POST') {
    const payload = options?.body as Record<string, unknown> | undefined;
    
    // Validate OTP
    if (!payload?.otpCode || !payload?.email) {
      return {
        status: 400,
        body: {
          code: 'VALIDATION_ERROR',
          message: 'Thiếu mã OTP hoặc email',
        },
      };
    }
    
    // Mock OTP verification - accept "123456" as valid OTP
    const isValidOtp = payload.otpCode === '123456';
    
    if (!isValidOtp) {
      return {
        status: 400,
        body: {
          code: 'INVALID_OTP',
          message: 'Mã OTP không hợp lệ',
        },
      };
    }
    
    // Return auth token and user info
    return {
      status: 200,
      body: {
        accessToken: 'demo-token-verified-' + Date.now(),
        user: {
          id: 'user-' + Date.now(),
          email: payload.email,
          role: 'user',
        },
      },
    };
  }
  
  if (pathname === endpoints.auth.me && method === 'GET') {
    return { status: 200, body: { id: 'demo-user', fullName: 'Demo User' } };
  }

  if (pathname === endpoints.auth.me && (method === 'PUT' || method === 'PATCH')) {
    const payload = options?.body as { username?: string; avatarUrl?: string } | undefined;
    if (!payload?.username || !payload?.avatarUrl) {
      return {
        status: 400,
        body: {
          code: 'VALIDATION_ERROR',
          message: 'username và avatarUrl là bắt buộc',
        },
      };
    }

    return {
      status: 200,
      body: {
        username: payload.username,
        avatarUrl: payload.avatarUrl,
      },
    };
  }

  if (pathname === endpoints.auth.password && method === 'PUT') {
    const payload = options?.body as { newPassword?: string } | undefined;
    if (!payload?.newPassword || typeof payload.newPassword !== 'string') {
      return {
        status: 400,
        body: {
          code: 'VALIDATION_ERROR',
          message: 'newPassword là bắt buộc',
        },
      };
    }

    return {
      status: 200,
      body: {
        success: true,
      },
    };
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

  if (pathname === endpoints.seller.shops && method === 'POST') {
    const payload = options?.body as SellerShopRegistrationDto | undefined;
    if (
      !payload?.shop_info?.shop_name ||
      !payload?.shop_info?.legal_full_name ||
      !payload?.shop_info?.identity_number ||
      !payload?.shop_info?.tax_code ||
      !payload?.shop_address?.receiver_name ||
      !payload?.shop_address?.receiver_phone ||
      !payload?.shop_address?.city ||
      !payload?.shop_address?.ward ||
      !payload?.shop_address?.details
    ) {
      return {
        status: 400,
        body: {
          code: 'VALIDATION_ERROR',
          message: 'Thiếu thông tin đăng ký shop',
          details: {
            fields: {
              shop_name: !payload?.shop_info?.shop_name ? 'required' : undefined,
              legal_full_name: !payload?.shop_info?.legal_full_name ? 'required' : undefined,
              identity_number: !payload?.shop_info?.identity_number ? 'required' : undefined,
              tax_code: !payload?.shop_info?.tax_code ? 'required' : undefined,
              receiver_name: !payload?.shop_address?.receiver_name ? 'required' : undefined,
              receiver_phone: !payload?.shop_address?.receiver_phone ? 'required' : undefined,
              city: !payload?.shop_address?.city ? 'required' : undefined,
              ward: !payload?.shop_address?.ward ? 'required' : undefined,
              details: !payload?.shop_address?.details ? 'required' : undefined,
            },
          },
        },
      };
    }

    return {
      status: 200,
      body: {
        id: 'shop-' + Date.now(),
        status: 'pending',
      },
    };
  }

  // Product search endpoints
  if (pathname.startsWith(endpoints.products.keywordSearch) && method === 'GET') {
    const pathParts = pathname.split('/');
    const keyword = pathParts[pathParts.length - 1];
    const page = Number((options?.query?.page as number | undefined) ?? url.searchParams.get('page') ?? 1);
    const limit = Number((options?.query?.limit as number | undefined) ?? url.searchParams.get('limit') ?? 10);

    // Filter products from seller products seed based on keyword
    let items = productsSeed.filter((p) => like(`${p.id} ${p.name} ${p.sku}`, keyword));
    
    // Map seller products to customer product format
    const customerProducts: any[] = items.map((p) => ({
      id: p.id,
      name: p.name,
      category_id: 1,
      product_variants: [
        {
          id: 'variant-' + p.id,
          sku: p.sku,
          name: p.name,
          stock: p.stock,
          file_path: 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(p.name),
          product_id: p.id,
          sale_price: p.price,
          input_price: Math.round(p.price * 0.8),
        },
      ],
      product_images: [
        {
          file_path: 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(p.name),
        },
      ],
    }));

    const paginatedItems = customerProducts.slice((page - 1) * limit, page * limit);
    
    return {
      status: 200,
      body: {
        success: true,
        data: paginatedItems,
        pagination: {
          page,
          limit,
          total: customerProducts.length,
          pages: Math.ceil(customerProducts.length / limit),
        },
      },
    };
  }

  // customer endpoints
  if (pathname === endpoints.customer.cart && method === 'GET') {
    return {
      status: 200,
      body: {
        success: true,
        cart: {
          items: [
            {
              id: '4d9c41ad-7d49-4343-8548-9eb12c1534c5',
              product_id: '34e9e212-c25a-4f51-b3d2-58f700895783',
              product_name: 'IPhone 14 new official 123',
              file_path:
                'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRr7XNhxYeccF1wMMbIoAkaC4RdtdiSRHvUyO0WhVNDN7vXLoUG4rRnMLcdeDysMG5FhvggvQ0xefYamBjCAVtAn9xDf1twGJWtJIp1CLECGMQOH0TmaiGpe_rlBhNLvXvsHpyjNpY&usqp=CAc',
              price: 14950000,
              quantity: 1,
              subtotal: 14950000,
            },
            {
              id: '8461a546-4e4b-4cf0-b308-91b8b4498a0f',
              product_id: 'ffa809aa-1538-430e-ad96-4328d0a7c86f',
              product_name: 'MacBook Air 13 M4 2025 10CPU/8GPU/16GB/256GB',
              file_path: '2983e694-eed9-49c2-b0d5-4e25d2835091/ffa809aa-1538-430e-ad96-4328d0a7c86f/variant_files-1780235879525-1.webp',
              price: 24990000,
              quantity: 2,
              subtotal: 49980000,
            },
          ],
          total: 64930000,
          count: 2,
        },
      },
    };
  }

  if (pathname === endpoints.customer.orders && method === 'GET') {
    return {
      status: 200,
      body: [
        { id: 'C-2026-1001', total: 129000, status: 'completed' },
        { id: 'C-2026-1002', total: 320000, status: 'shipping' },
        { id: 'C-2026-1003', total: 780000, status: 'pending' },
      ],
    };
  }

  if (pathname.startsWith('orders/customer/orders/') && method === 'DELETE') {
    return {
      status: 200,
      body: { success: true },
    };
  }

  if (pathname.startsWith('orders/customer/orders/') && method === 'GET') {
    const orderId = pathname.split('/').pop() ?? 'unknown';
    return {
      status: 200,
      body: {
        id: orderId,
        history: [
          { status: 'Đã tiếp nhận', timestamp: '2026-06-07T08:12:00Z', note: 'Đơn hàng đã được tiếp nhận và đang xử lý.' },
          { status: 'Đang giao', timestamp: '2026-06-07T11:30:00Z', note: 'Đơn hàng đang được vận chuyển đến điểm giao hàng.' },
          { status: 'Hoàn thành', timestamp: '2026-06-07T15:45:00Z', note: 'Đơn hàng đã được giao thành công.' },
        ],
      },
    };
  }

  return null;
}

